import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  File, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useUsage } from '../../context/UsageContext';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { user, tier } = useAuth();
  const { incrementUsage, limits, isOverLimit, setShowUpgradeModal } = useUsage();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (tier === 'free') {
      const overSized = acceptedFiles.some(f => f.size > limits.maxPdfSize);
      if (overSized) {
        setError(`Dior Free tier is limited to ${limits.maxPdfSize / (1024 * 1024)}MB per file.`);
        return;
      }
      
      // Check if adding these files would exceed upload limit
      // files.length + acceptedFiles.length
      // But we check on click too.
    }
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError('');
  }, [tier, limits]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    if (tier === 'free') {
      if (isOverLimit('uploads')) {
        setShowUpgradeModal(true);
        onClose();
        return;
      }
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Process files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data URL prefix
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        
        const fileData = await base64Promise;
        
        // Call the analysis API
        const response = await fetch('/api/analyze-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
            mimeType: file.type,
            tier // Use tier from context
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to analyze ${file.name}`);
        }

        const analysis = await response.json();

        // Save to Firestore
        await addDoc(collection(db, 'users', user.uid, 'uploads'), {
          userId: user.uid,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          aiSummary: analysis.summary,
          concepts: analysis.concepts || [],
          questions: analysis.questions || [],
          strategy: analysis.strategy || "",
          processed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        setProgress(Math.round(((i + 1) / files.length) * 100));
        incrementUsage('uploads');
        incrementUsage('summaries');
      }

      setComplete(true);
      
      setTimeout(() => {
        onClose();
        setFiles([]);
        setComplete(false);
        setUploading(false);
        setProgress(0);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to upload material');
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-400" />;
    if (type.includes('image')) return <ImageIcon className="w-6 h-6 text-blue-400" />;
    if (type.includes('word')) return <FileText className="w-6 h-6 text-blue-600" />;
    return <File className="w-6 h-6 text-gray-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl glass p-6 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] relative z-10 overflow-hidden border border-theme shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 lg:top-8 lg:right-8 p-2 glass rounded-full border border-theme hover:bg-surface transition-colors text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 lg:mb-10 text-primary">
              <h2 className="text-2xl lg:text-4xl font-serif italic mb-2">Ingest Material</h2>
              <p className="text-secondary text-[10px] lg:text-sm uppercase tracking-widest">Digitize your knowledge for AI synthesis.</p>
            </div>

            {!complete ? (
              <div className="space-y-6">
                {/* Dropzone */}
                {!uploading && (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-3xl p-8 lg:p-16 text-center transition-all cursor-pointer ${
                      isDragActive ? 'border-primary/40 bg-surface' : 'border-theme hover:border-primary/20'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-12 h-12 lg:w-20 lg:h-20 glass rounded-2xl flex items-center justify-center mx-auto mb-4 border border-theme">
                      <Upload className={`w-6 h-6 lg:w-10 lg:h-10 transition-transform text-secondary ${isDragActive ? 'scale-110 text-primary' : ''}`} />
                    </div>
                    <p className="font-bold mb-1 text-sm lg:text-base text-primary">Drag & drop files here</p>
                    <p className="text-[8px] lg:text-[10px] text-secondary uppercase tracking-[0.2em]">PDF, DOCX, PNG, JPG (MAX 10MB)</p>
                  </div>
                )}

                {/* File List */}
                {files.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {files.map((file, i) => (
                      <div key={i} className="glass p-4 rounded-2xl flex items-center justify-between group border border-theme">
                        <div className="flex items-center gap-4">
                          {getFileIcon(file.type)}
                          <div className="text-primary text-left">
                            <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-secondary tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        {!uploading && (
                          <button onClick={() => removeFile(i)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4 text-secondary hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs text-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Upload Status */}
                {uploading && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-secondary">Synchronizing with Cloud...</span>
                      </div>
                      <span className="text-xs font-black text-primary">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-theme">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                      />
                    </div>
                  </div>
                )}

                {!uploading && files.length > 0 && (
                  <button 
                    onClick={handleUpload}
                    className="w-full py-4 bg-primary text-inverted rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                  >
                    Start AI Synthesis
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 glass border border-theme rounded-full flex items-center justify-center mb-6 text-green-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-serif italic mb-2 text-primary">Synthesis Successful</h3>
                <p className="text-secondary text-sm">Your materials are now being processed by Dior.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
