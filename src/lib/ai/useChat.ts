import { useCallback, useState } from "react";
import { sendChatMessage, type ChatMessage, type ChatMode } from "./client";

type LocalMessage = ChatMessage & {
  // What actually gets sent to the model for this turn, if it needs to
  // differ from what's shown in the bubble (e.g. CV text prepended to the
  // first message) — used to be the WYSIWYG assumption ("what's displayed
  // is what's sent"), but that broke down once a message needed hidden
  // context. Falls back to `content` when absent, so every existing caller
  // (SalesWidget) is unaffected.
  apiContent?: string;
};

/**
 * Shared chat state machine — both the sales widget (Piece 3) and the
 * discovery agent (Piece 4) use this instead of duplicating fetch/loading/
 * error handling.
 */
export function useChat(mode: ChatMode) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (content: string, apiContent?: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const next: LocalMessage[] = [...messages, { role: "user", content: trimmed, apiContent }];
      setMessages(next);
      setIsLoading(true);
      setError(null);

      try {
        const wireMessages: ChatMessage[] = next.map((m) => ({
          role: m.role,
          content: m.apiContent ?? m.content,
        }));
        const reply = await sendChatMessage(mode, wireMessages);
        setMessages([...next, { role: "assistant", content: reply }]);
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
