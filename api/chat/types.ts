/** A minimal message shape sent to the chat API */
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Payload sent to the chat API */
export type ChatRequest = {
  messages: ChatMessage[];
};

/** A single chat conversation */
export type ChatConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
