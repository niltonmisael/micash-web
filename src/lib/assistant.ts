"use client";

import { api } from "./api";

/** RequestChatMessageJson max length (ValidatorChatMessage.MAX_LENGTH in the API). */
export const CHAT_MESSAGE_MAX_LENGTH = 1000;

export type ChatMessage = { id: number; role: "user" | "assistant"; content: string; createdAt: string };

export type ChatHistory = { conversationId: number | null; messages: ChatMessage[]; hasMore: boolean };

type ChatAnswer = {
  id: number;
  userMessageId: number;
  conversationId: number;
  message: string;
  createdAt: string;
};

/** Active conversation, newest page (oldest first). `before` = id of the oldest loaded message. */
export function getChatHistory(before?: number) {
  return api<ChatHistory>("api/chat/messages", { query: { before, limit: 30 } });
}

/**
 * Sends a question. Free: 5 per month (403 PLAN_LIMIT_REACHED); Premium: 30 per day and 5 per minute
 * (429 CHAT_RATE_LIMIT, with retryAt).
 */
export function sendChatMessage(message: string) {
  return api<ChatAnswer>("api/chat/message", { method: "POST", body: { message } });
}

/** Starts an empty conversation (the old one stays stored, it just stops being the active one). */
export function startConversation() {
  return api<{ conversationId: number }>("api/chat/conversations", { method: "POST" });
}
