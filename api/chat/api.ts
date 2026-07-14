import apiClient from "@/api/client";
import type { ChatRequest } from "./types";

/**
 * Send a chat message and receive a streaming response.
 *
 * Uses native `fetch` (not axios) because axios does not natively
 * support streaming `ReadableStream` responses the way the AI SDK
 * expects. The AI SDK's `useChat` hook handles this internally.
 *
 * This function is provided for manual streaming usage when not
 * using the `useChat` hook.
 */
export async function sendChatMessage(
  body: ChatRequest,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

/** Fetch the list of past chat conversations */
export async function getChatConversations(): Promise<
  { id: string; title: string; createdAt: string }[]
> {
  const { data } = await apiClient.get<
    { id: string; title: string; createdAt: string }[]
  >("/chat/conversations");
  return data;
}
