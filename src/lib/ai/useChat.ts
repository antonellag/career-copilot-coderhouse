import { useCallback, useState } from "react";
import { sendChatMessage, type ChatMessage, type ChatMode } from "./client";

/**
 * Shared chat state machine — both the sales widget (Piece 3) and the
 * discovery agent (Piece 4) use this instead of duplicating fetch/loading/
 * error handling.
 */
export function useChat(mode: ChatMode) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const next = [...messages, { role: "user" as const, content: trimmed }];
      setMessages(next);
      setIsLoading(true);
      setError(null);

      try {
        const reply = await sendChatMessage(mode, next);
        setMessages([...next, { role: "assistant" as const, content: reply }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo salió mal. Probá de nuevo.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, mode, isLoading],
  );

  return { messages, send, isLoading, error };
}
