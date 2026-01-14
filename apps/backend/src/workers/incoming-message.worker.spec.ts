import * as runtime from "@prisma/client/runtime/client";

import { Bot } from "../domain/bots/Bot";
import { Chat } from "../domain/chats/Chat";
import { Message } from "../domain/chats/Message";
import { createProcessBotUpdate } from "./incoming-message.worker";
import { classifyError, ErrorType } from "../infra/errors/ErrorClassifier";
import { BotHandleUpdatePayload } from "../infra/jobs/pgBoss/jobs";

const { Decimal } = runtime;

describe("incoming-message.worker", () => {
  const bot = new Bot({
    id: "1",
    ownerUserId: "123",
    name: "Test Bot",
    startMessage: "start message",
    errorMessage: "error message",
    model: "gpt-4o-mini",
    token: "bot-token",
    enabled: true,
    telegramMode: "webhook",
    error: null,
    prompt: "Hello",
    createdAt: new Date(),
  });

  const chat = new Chat({
    id: "1231",
    telegramChatId: BigInt(123),
    botId: 1,
    tgUserId: BigInt(123),
    name: "Test",
    createdAt: new Date(),
  });

  const userMessage = new Message({
    id: 10,
    chatId: chat.id,
    tgUserId: chat.tgUserId,
    botId: chat.botId,
    text: "/start",
    telegramUpdateId: BigInt(5),
    userMessageId: null,
    createdAt: new Date(),
  });

  const botMessage = new Message({
    id: 11,
    chatId: chat.id,
    tgUserId: null,
    botId: chat.botId,
    text: bot.startMessage,
    telegramUpdateId: null,
    userMessageId: userMessage.id,
    createdAt: new Date(),
  });

  const payload: BotHandleUpdatePayload = {
    botId: "1",
    telegramUpdateId: 5,
    chatId: 123,
    userId: 123,
    messageId: 50,
    text: "/start",
    callbackData: undefined,
    kind: "message",
    raw: {
      update_id: 5,
      message: {
        message_id: 50,
        date: Date.now(),
        chat: { id: 123, type: "private" },
        from: { id: 123, first_name: "John", username: "john" },
        text: "/start",
      },
    },
  };

  it("processes /start without OpenAI call", async () => {
    const botRepository = {
      findById: jest.fn().mockResolvedValue(bot),
      save: jest.fn(),
    };
    const chatRepository = {
      findById: jest.fn().mockResolvedValue(chat),
      findOrCreateUser: jest.fn().mockResolvedValue({ id: BigInt(123) }),
      findOrCreateChat: jest.fn().mockResolvedValue(chat),
      save: jest.fn(),
    };
    const messageRepository = {
      findByTelegramUpdateId: jest.fn().mockResolvedValue(null),
      findUserMessageByTelegramUpdate: jest.fn(),
      findBotResponseForUserMessage: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(userMessage),
      save: jest.fn(),
      createUserMessage: jest.fn().mockResolvedValue(userMessage),
      createBotMessage: jest.fn().mockResolvedValue(botMessage),
    };
    const messageProcessingRepository = {
      getOrCreateForUserMessage: jest.fn().mockResolvedValue({
        id: 1,
        userMessageId: userMessage.id,
        status: "RECEIVED",
        responseMessageId: null,
        responseSentAt: null,
        telegramUpdateId: BigInt(5),
      }),
      markProcessing: jest.fn(),
      markResponseGenerated: jest.fn(),
      markResponseSent: jest.fn(),
      markCompleted: jest.fn(),
      findByUserMessageId: jest.fn().mockResolvedValue({
        id: 1,
        userMessageId: userMessage.id,
        status: "PROCESSING",
        responseMessageId: null,
        responseSentAt: null,
      }),
      updateTelegramIds: jest.fn(),
    };
    const openAIClient = { getAnswer: jest.fn() };
    const settingsRepository = {
      getSetting: jest.fn().mockResolvedValue(""),
      setSetting: jest.fn(),
      getAllSettings: jest.fn(),
      deleteSetting: jest.fn(),
    };
    const sendMessage = jest.fn().mockResolvedValue({ messageId: 777 });
    const telegramClientFactory = jest.fn().mockReturnValue({ sendMessage });

    const processBotUpdate = createProcessBotUpdate({
      botRepository: botRepository as any,
      chatRepository: chatRepository as any,
      messageRepository: messageRepository as any,
      messageProcessingRepository: messageProcessingRepository as any,
      openAIClient: openAIClient as any,
      settingsRepository: settingsRepository as any,
      telegramClientFactory: telegramClientFactory as any,
      log: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });

    await processBotUpdate(payload);

    expect(openAIClient.getAnswer).not.toHaveBeenCalled();
    expect(messageRepository.createUserMessage).toHaveBeenCalled();
    expect(messageRepository.createBotMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: bot.startMessage })
    );
    expect(sendMessage).toHaveBeenCalledWith({
      chatId: payload.chatId.toString(),
      text: bot.startMessage,
    });
  });

  it("classifies errors with status codes", () => {
    expect(classifyError({ statusCode: 401 })).toBe(ErrorType.FATAL);
    expect(classifyError({ status: 502 })).toBe(ErrorType.RETRYABLE);
    expect(classifyError(new Error("rate limit exceeded"))).toBe(
      ErrorType.RETRYABLE
    );
  });

  it("handles callback_query by answering and returning immediately", async () => {
    const callbackPayload: BotHandleUpdatePayload = {
      botId: "1",
      telegramUpdateId: 100,
      chatId: 123,
      userId: 123,
      messageId: 50,
      text: undefined,
      callbackData: "button_clicked",
      callbackQueryId: "callback-query-id-123",
      kind: "callback_query",
      raw: {
        update_id: 100,
        callback_query: {
          id: "callback-query-id-123",
          from: { id: 123, first_name: "John", username: "john" },
          message: {
            message_id: 50,
            date: Date.now(),
            chat: { id: 123, type: "private" },
          },
          data: "button_clicked",
        },
      },
    };

    const botRepository = {
      findById: jest.fn().mockResolvedValue(bot),
      save: jest.fn(),
    };
    const chatRepository = {
      findById: jest.fn(),
      findOrCreateUser: jest.fn(),
      findOrCreateChat: jest.fn(),
      save: jest.fn(),
    };
    const messageRepository = {
      findByTelegramUpdateId: jest.fn(),
      findUserMessageByTelegramUpdate: jest.fn(),
      findBotResponseForUserMessage: jest.fn(),
      save: jest.fn(),
      createUserMessage: jest.fn(),
      createBotMessage: jest.fn(),
    };
    const openAIClient = { getAnswer: jest.fn() };
    const answerCallbackQuery = jest.fn().mockResolvedValue(undefined);
    const sendMessage = jest.fn();
    const telegramClientFactory = jest
      .fn()
      .mockReturnValue({ sendMessage, answerCallbackQuery });
    const logInfo = jest.fn();

    const messageProcessingRepository = {
      getOrCreateForUserMessage: jest.fn().mockResolvedValue({
        id: 1,
        userMessageId: userMessage.id,
        status: "RECEIVED",
        responseMessageId: null,
        responseSentAt: null,
      }),
      markProcessing: jest.fn(),
      markResponseGenerated: jest.fn(),
      markResponseSent: jest.fn(),
      markCompleted: jest.fn(),
      findByUserMessageId: jest.fn().mockResolvedValue({
        id: 1,
        userMessageId: userMessage.id,
        status: "PROCESSING",
        responseMessageId: null,
        responseSentAt: null,
      }),
      updateTelegramIds: jest.fn(),
    };

    const settingsRepository = {
      getSetting: jest.fn().mockResolvedValue(""),
      setSetting: jest.fn(),
      getAllSettings: jest.fn(),
      deleteSetting: jest.fn(),
    };

    const processBotUpdate = createProcessBotUpdate({
      botRepository: botRepository as any,
      chatRepository: chatRepository as any,
      messageRepository: messageRepository as any,
      messageProcessingRepository: messageProcessingRepository as any,
      openAIClient: openAIClient as any,
      settingsRepository: settingsRepository as any,
      telegramClientFactory: telegramClientFactory as any,
      log: {
        info: logInfo,
        error: jest.fn(),
      },
    });

    await processBotUpdate(callbackPayload);

    // Should answer callback query
    expect(answerCallbackQuery).toHaveBeenCalledWith({
      callbackQueryId: "callback-query-id-123",
    });

    // Should NOT process as a regular message
    expect(openAIClient.getAnswer).not.toHaveBeenCalled();
    expect(messageRepository.createUserMessage).not.toHaveBeenCalled();
    expect(messageRepository.createBotMessage).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();

    // Should log the callback
    expect(logInfo).toHaveBeenCalledWith(
      "Callback query answered",
      expect.objectContaining({
        botId: "1",
        callbackQueryId: "callback-query-id-123",
        callbackData: "button_clicked",
      })
    );
  });
});
