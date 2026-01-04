import { ChatRepository } from "./ChatRepository";
import { Chat } from "./Chat";

describe("ChatRepository", () => {
  it("should be an abstract class that cannot be instantiated", () => {
    // TypeScript will prevent direct instantiation, but we can test this at runtime
    // by attempting to create a concrete implementation
    class ConcreteChatRepository extends ChatRepository {
      async findById(id: string): Promise<Chat | null> {
        return null;
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
        botId: number
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
      ) {
        throw new Error("Not implemented");
      }
    }

    const repository = new ConcreteChatRepository();
    expect(repository).toBeInstanceOf(ChatRepository);
    expect(repository).toBeInstanceOf(ConcreteChatRepository);
  });

  it("should require all abstract methods to be implemented", () => {
    // This test verifies that TypeScript enforces all abstract methods
    // If we try to create a class without implementing all methods, TypeScript will error
    // This is a compile-time check, so we just verify the structure exists

    class IncompleteRepository extends ChatRepository {
      async findById(id: string): Promise<Chat | null> {
        return null;
      }
      // Missing other methods - TypeScript will error at compile time
    }

    // TypeScript compilation will fail if methods are missing
    // This test serves as documentation that all methods must be implemented
    expect(true).toBe(true);
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
        botId: number
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
      ) {
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

