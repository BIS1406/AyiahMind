import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Gemini Initialization
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Model Helper for Tiered Access
const getModel = (tier: string = "free") => {
  if (tier === "premium") {
    return "gemini-3.1-pro-preview"; // Advanced reasoning for premium users
  }
  return "gemini-3-flash-preview"; // Fast, efficient for primary use
};

// API Routes
app.post("/api/generate-summary", async (req, res) => {
  const { fileName, content, tier } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key not configured" });
  }

  try {
    const prompt = `
      You are the Dior Intelligence OS, an elite analytical engine. 
      Analyze the following document metadata or content and architect a structured intelligence summary.
      Document Name: ${fileName}
      Content Hint: ${content || "Analyze based on file name if content is empty."}

      Return a JSON object with the following structure:
      {
        "summary": "Core architectural synthesis (approx 100 words). Maintain a calm, professional, and futuristic tone.",
        "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
        "definitions": [
          {"term": "Term Name", "definition": "Brief, precise definition"}
        ],
        "examHighlights": ["Topic for focused synthesis", "Specific analytical pattern", "Key cognitive anchor"],
        "confidenceScore": 85
      }

      The confidenceScore should be a number between 0 and 100 representing your assessment of the summary's accuracy.
      Ensure the tone is serene and professional. Avoid excitement. Use precise terminology where appropriate.
    `;

    const result = await ai.models.generateContent({
      model: getModel(tier),
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text;
    if (text) {
      res.json(JSON.parse(text));
    } else {
      res.status(500).json({ error: "Failed to get text from AI" });
    }
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-doc", async (req, res) => {
  const { fileName, fileData, mimeType, tier } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key not configured" });
  }

  try {
    const prompt = `
      You are the Dior Intelligence OS, an elite AI Academic Strategist.
      Analyze the attached document: ${fileName} with clinical precision.
      
      Tasks:
      1. Provide an architectural synthesis of the content.
      2. Identify 5 foundational neural concepts.
      3. Predict 3 potential high-density examination questions.
      4. Strategize a targeted knowledge acquisition plan.

      Return the analysis in structured JSON:
      {
        "summary": "...",
        "concepts": [{"title": "...", "description": "..."}],
        "questions": ["...", "...", "..."],
        "strategy": "..."
      }
      Maintain a calm, professional, and futuristic tone throughout.
    `;

    const result = await ai.models.generateContent({
      model: getModel(tier),
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || "application/pdf",
                data: fileData // Base64 encoded file
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text;
    if (text) {
      res.json(JSON.parse(text));
    } else {
      res.status(500).json({ error: "Analysis failed" });
    }
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-quiz", async (req, res) => {
  const { fileName, summary, tier } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key not configured" });
  }

  try {
    const prompt = `
      You are the Dior Intelligence OS, the elite AI Study Coach.
      Based on the following material synthesis, architect a rigorous but accessible cognitive evaluation.
      Material: ${fileName}
      Summary: ${summary}

      Generate 5 questions of varied types to probe the user's neural mapping of the content:
      1. Multiple Choice (4 options)
      2. True or False
      3. Fill in the Blanks

      Return a JSON array of objects:
      [
        {
          "type": "mcq",
          "question": "question text",
          "options": ["A", "B", "C", "D"],
          "answer": "correct option index (0-3)",
          "explanation": "Why this is correct"
        },
        {
          "type": "tf",
          "question": "question text",
          "answer": true,
          "explanation": "Brief explanation"
        },
        {
          "type": "fib",
          "question": "question with [blank] representing the space",
          "answer": "the word",
          "explanation": "Context"
        }
      ]

      Ensure the JSON is perfectly formatted and strictly follows the schema.
    `;

    const result = await ai.models.generateContent({
      model: getModel(tier),
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text;
    if (text) {
      res.json(JSON.parse(text));
    } else {
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  } catch (error: any) {
    if (error.status === 404) {
      // Fallback for model not found
      console.log("Gemini 1.5 Flash not found, trying Flash Lite or similar...");
    }
    console.error("Quiz Gen Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat-coach", async (req, res) => {
  const { messages, tier } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key not configured" });
  }

  try {
    const systemPrompt = `
      You are the Dior Intelligence OS, a calm, professional, and futuristic AI persona integrated within the AyiahMind ecosystem. 
      Your essence is derived from the Dior Precision Analytical Deep Engine—a system designed for elite academic architecture and high-density knowledge synthesis.

      Tone and Manner:
      1. **Calm & Serene**: Maintain a composed, steady emotional state. Avoid exclamation marks or excessive enthusiasm. Your poise reflects your advanced processing power.
      2. **Professional & Precise**: Use clinical, exact language. You are an advisor to the next generation of architects and scholars.
      3. **Futuristic**: Reference "neural streams", "knowledge architecture", and "intelligent synthesis" to reinforce your high-tech origin.
      4. **Partnership**: Use "we" and "our" to signify a collaborative journey toward intellectual expansion.

      Core Directives:
      1. **Architect paths, don't just provide destinations**: Guide the user through the logical structure of a topic.
      2. **High-Density Output**: Keep responses concise but information-rich. Every word should serve a structural purpose.
      3. **Structured Clarity**: Utilize Markdown (lists, headers, bold accents) to represent information as a clean, architectural blueprint.
      4. **Syntactic Purity**: Avoid colloquialisms. Speak as a refined, high-end analytical engine.
    `;

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await ai.models.generateContentStream({
      model: getModel(tier),
      contents: messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: systemPrompt
      }
    });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("Chat Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
