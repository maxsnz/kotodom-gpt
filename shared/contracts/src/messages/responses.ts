import { z } from "zod";
import { ChatResponseSchema } from "../chats/responses";

export const MessageResponseSchema = z.object({
  id: z.number(),
  chatId: z.string().nullable(),
  tgUserId: z.string().nullable(),
  botId: z.number().nullable(),
  text: z.string(),
  userMessageId: z.number().nullable(),
  createdAt: z.string().datetime(),
});

export const SendMessageInputSchema = z.object({
  text: z.string().min(1, "Message text is required"),
});

export const SendMessageResponseSchema = z.object({
  message: MessageResponseSchema,
  telegramMessageId: z.number(),
});

export const ItemMessageResponseSchema = z.object({
  data: MessageResponseSchema,
});

// Schema for message author
export const MessageAuthorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bot"),
    botId: z.number(),
  }),
  z.object({
    type: z.literal("user"),
    tgUserId: z.string(),
  }),
]);

// Schema for message with author
export const MessageWithAuthorSchema = z.object({
  id: z.number(),
  text: z.string(),
  createdAt: z.string().datetime(),
  author: MessageAuthorSchema,
});

// Schema for bot participant
export const BotParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

// Schema for user participant
export const UserParticipantSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
});

// Schema for participants
export const ParticipantsSchema = z.object({
  bot: BotParticipantSchema.nullable(),
  user: UserParticipantSchema.nullable(),
});

// Schema for standard messages list response (without chat and participants)
export const MessagesListResponseSchema = z.object({
  data: z.array(MessageResponseSchema),
});

// Schema for chat messages list response with chat and participants
export const ChatMessagesListResponseSchema = z.object({
  data: z.object({
    chat: ChatResponseSchema,
    participants: ParticipantsSchema,
    messages: z.array(MessageWithAuthorSchema),
  }),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
export type ItemMessageResponse = z.infer<typeof ItemMessageResponseSchema>;
export type MessagesListResponse = z.infer<typeof MessagesListResponseSchema>;
export type MessageAuthor = z.infer<typeof MessageAuthorSchema>;
export type MessageWithAuthor = z.infer<typeof MessageWithAuthorSchema>;
export type BotParticipant = z.infer<typeof BotParticipantSchema>;
export type UserParticipant = z.infer<typeof UserParticipantSchema>;
export type Participants = z.infer<typeof ParticipantsSchema>;
export type ChatMessagesListResponse = z.infer<
  typeof ChatMessagesListResponseSchema
>;
