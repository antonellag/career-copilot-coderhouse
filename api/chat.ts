import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Explicit ".js" extension required here (not ".ts") — Vercel's Node.js
// function builder ships this as native ESM and Node's ESM resolver, unlike
// Vite's bundler resolution used everywhere else in this repo, does not do
// extensionless relative-import resolution. Without it this throws
// ERR_MODULE_NOT_FOUND in production while still working under `vercel dev`
// locally (confirmed live via `vercel logs` after a real prod deploy).
import { getSystemPrompt, type ChatMode } from "./_lib/prompts.js";

/**
 * Shared conversational engine for both AI surfaces (the footer sales widget
 * and the /limbo discovery agent). One Vercel serverless function, one model
 * call — only the system prompt changes based on `mode`.
 *
 * This file is the ONLY place that talks to the Gemini API. The API key
 * (GEMINI_API_KEY) lives in a server-side env var — .env.local locally,
 * a Vercel project env var in production — and is never sent to the client.
 *
 * Request body: { mode: "sales" | "discovery", messages: ChatMessage[] }
 * Response body: { reply: string }
 */

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// gemini-2.0-flash, then gemini-2.5-flash, both 404'd in production
// ("no longer available" / "no longer available to new users" — confirmed
// live via `vercel logs`). New API keys are restricted from the older model
// generations entirely, regardless of the model still existing for
// pre-existing users/projects. gemini-3.5-flash is Google's current
// recommendation for new keys as of this session.
const MODEL_NAME = "gemini-3.5-flash";

function isChatMode(value: unknown): value is ChatMode {
  return value === "sales" || value === "discovery";
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (v.role === "user" || v.role === "assistant") && typeof v.content === "string";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
    return;
  }

  const { mode, messages } = req.body ?? {};

  if (!isChatMode(mode)) {
    res.status(400).json({ error: "mode must be 'sales' or 'discovery'" });
    return;
  }
  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
    res.status(400).json({ error: "messages must be a non-empty array of { role, content }" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: getSystemPrompt(mode),
    });

    // Gemini's chat history excludes the final turn (that's sendMessage's argument),
    // and its first entry must be role "user" — trim any leading assistant turn.
    const history = messages.slice(0, -1);
    const firstUserIndex = history.findIndex((m) => m.role === "user");
    const trimmedHistory = firstUserIndex === -1 ? [] : history.slice(firstUserIndex);

    const chat = model.startChat({
      history: trimmedHistory.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error("[api/chat] Gemini call failed:", error);
    res.status(502).json({ error: "The AI model call failed. Try again." });
  }
}
