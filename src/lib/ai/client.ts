/**
 * Client-side entry point for both AI surfaces. This is the ONLY place in
 * src/** that talks to /api/chat — it never touches the model API directly
 * (no API key ever ships to the browser). The footer sales widget and the
 * /limbo discovery agent both call this same function with a different mode.
 */

export type ChatMode = "sales" | "discovery-experiencia" | "discovery-habilidades" | "discovery-resultado";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function sendChatMessage(mode: ChatMode, messages: ChatMessage[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, messages }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Chat request failed with status ${response.status}`);
  }

  const data: { reply: string } = await response.json();
  return data.reply;
}
