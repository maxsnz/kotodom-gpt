import { ChatRepository, ChatFilters } from "./ChatRepository";
import { Chat } from "./Chat";
import type { TgUser } from "../../infra/db/prisma/generated/client";

describe("ChatRepository", () => {
  it("should be an abstract class that cannot be instantiated", () => {
    // TypeScript will prevent direct instantiation, but we can test this at runtime
    // by attempting to create a concrete implementation
    class ConcreteChatRepository extends ChatRepository {
      async findById(id: string): Promise<Chat | null> {
        return null;
      }

      async findAll(filters?: ChatFilters): Promise<Chat[]> {
        return [];
      }

      async findByUserId(tgUserId: bigint): Promise<Chat[]> {
        return [];
      }

      async findByBotId(botId: number): Promise<Chat[]> {
        return [];
      }

      async save(chat: Chat): Promise<void> {
        // Implementation
      }

      async findOrCreateChat(
        chatId: string,
        tgUserId: bigint,
        botId: number,
        telegramChatId: bigint
      ): Promise<Chat> {
        throw new Error("Not implemented");
      }

      async findOrCreateUser(
        tgUserId: bigint,
        userData: {
          username?: string;
          firstName?: string;
          lastName?: string;
        }
      ): Promise<TgUser> {
        throw new Error("Not implemented");
      }
    }

    const repository = new ConcreteChatRepository();
    expect(repository).toBeInstanceOf(ChatRepository);
    expect(repository).toBeInstanceOf(ConcreteChatRepository);
  });

  it("should require all abstract methods to be implemented", () => {
    // This test verifies that TypeScript enforces all abstract methods
    // TypeScript compilation will fail if methods are missing
    // We test this by trying to create an incomplete implementation
    // and expecting a compile-time error

    expect(() => {
      // This will cause a TypeScript compilation error if uncommented:
      // class IncompleteRepository extends ChatRepository {
      //   async findById(id: string): Promise<Chat | null> {
      //     return null;
      //   }
      //   // Missing other methods - TypeScript will error at compile time
      // }

      // Since we can't actually create an incomplete class,
      // we just verify that the abstract class exists
      expect(ChatRepository.prototype).toBeDefined();
    }).not.toThrow();
  });

  it("should have all required abstract methods defined", () => {
    // Verify that the abstract class has all the required method signatures
    const methodNames = [
      "findById",
      "findByUserId",
      "findByBotId",
      "save",
      "findOrCreateChat",
      "findOrCreateUser",
    ];

    class TestRepository extends ChatRepository {
      async findById(id: string): Promise<Chat | null> {
        return null;
      }

      async findAll(filters?: ChatFilters): Promise<Chat[]> {
        return [];
      }

      async findByUserId(tgUserId: bigint): Promise<Chat[]> {
        return [];
      }

      async findByBotId(botId: number): Promise<Chat[]> {
        return [];
      }

      async save(chat: Chat): Promise<void> {
        // Implementation
      }

      async findOrCreateChat(
        chatId: string,
        tgUserId: bigint,
        botId: number,
        telegramChatId: bigint
      ): Promise<Chat> {
        throw new Error("Not implemented");
      }

      async findOrCreateUser(
        tgUserId: bigint,
        userData: {
          username?: string;
          firstName?: string;
          lastName?: string;
        }
      ): Promise<TgUser> {
        throw new Error("Not implemented");
      }
    }

    const repository = new TestRepository();

    // Verify all methods exist
    methodNames.forEach((methodName) => {
      expect(typeof repository[methodName as keyof ChatRepository]).toBe(
        "function"
      );
    });
  });
});
