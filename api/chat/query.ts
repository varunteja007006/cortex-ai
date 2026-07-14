"use client";

import {
  useQuery,
} from "@tanstack/react-query";
import { getChatConversations } from "./api";

/** Query key factory for chat domain */
export const chatKeys = {
  conversations: ["chat", "conversations"] as const,
};

/**
 * Hook to send a chat message.
 * For streaming, prefer `useChat` from the AI SDK.
 * This mutation is useful for non-streaming / fallback scenarios.
 */

/** Fetch past chat conversations */
export function useChatConversations() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: getChatConversations,
  });
}
