import * as runtime from "@prisma/client/runtime/client";

import { MessageRepositoryPrisma } from "./MessageRepositoryPrisma";
import { prisma } from "../prisma/client";
import { Message } from "../../../domain/chats/Message";

const { Decimal } = runtime;

jest.mock("../prisma/client", () => ({
  prisma: {
    message: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("MessageRepositoryPrisma", () => {
  let repository: MessageRepositoryPrisma;
  let mockPrisma: jest.Mocked<typeof prisma>;
  let prismaMessageMock: {
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(() => {
    repository = new MessageRepositoryPrisma();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    prismaMessageMock =
      mockPrisma.message as unknown as typeof prismaMessageMock;
    jest.clearAllMocks();
  });

  it("findByTelegramUpdateId should return message", async () => {
    const row = {
      id: 1,
      chatId: "123",
      tgUserId: BigInt(10),
      botId: 2,
      text: "hi",
      telegramUpdateId: BigInt(5),
      userMessageId: null,
      createdAt: new Date(),
    };
    prismaMessageMock.findFirst.mockResolvedValue(row as any);

    const result = await repository.findByTelegramUpdateId(5);

    expect(result).toBeInstanceOf(Message);
    expect(prismaMessageMock.findFirst).toHaveBeenCalledWith({
      where: { telegramUpdateId: BigInt(5) },
    });
  });

  it("createUserMessage should persist with defaults", async () => {
    // Mock findByTelegramUpdateId to return null (no existing message)
    prismaMessageMock.findFirst.mockResolvedValue(null);

    const created = {
      id: 2,
      chatId: "c1",
      tgUserId: BigInt(1),
      botId: 1,
      text: "hello",
      telegramUpdateId: BigInt(99),
      userMessageId: null,
      createdAt: new Date(),
    };
    prismaMessageMock.create.mockResolvedValue(created as any);

    const result = await repository.createUserMessage({
      chatId: "c1",
      tgUserId: BigInt(1),
      botId: 1,
      text: "hello",
      telegramUpdateId: BigInt(99),
    });

    expect(result).toBeInstanceOf(Message);
    expect(prismaMessageMock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chatId: "c1",
        tgUserId: BigInt(1),
        botId: 1,
        telegramUpdateId: BigInt(99),
        userMessageId: null,
      }),
    });
  });

  it("createBotMessage should link to user message", async () => {
    const created = {
      id: 3,
      chatId: "c1",
      tgUserId: null,
      botId: 1,
      text: "answer",
      telegramUpdateId: null,
      userMessageId: 2,
      createdAt: new Date(),
    };
    prismaMessageMock.create.mockResolvedValue(created as any);

    const result = await repository.createBotMessage({
      chatId: "c1",
      botId: 1,
      text: "answer",
      price: new Decimal(0.1),
      userMessageId: 2,
    });

    expect(result.userMessageId).toBe(2);
    expect(prismaMessageMock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userMessageId: 2,
      }),
    });
  });

  it("save should update all fields", async () => {
    const message = new Message({
      id: 4,
      chatId: "c1",
      tgUserId: BigInt(1),
      botId: 1,
      text: "text",
      telegramUpdateId: BigInt(10),
      userMessageId: 2,
      createdAt: new Date(),
    });

    await repository.save(message);

    expect(prismaMessageMock.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: expect.objectContaining({
        userMessageId: 2,
      }),
    });
  });
});
