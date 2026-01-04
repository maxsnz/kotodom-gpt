import { OpenAIClient } from "./openaiClient";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";

// Create mock SettingsRepository
const mockGetSetting = jest.fn();
const mockSettingsRepository: SettingsRepository = {
  getSetting: mockGetSetting,
  setSetting: jest.fn(),
} as any;

// Create mock OpenAI instance
const mockThreadsCreate = jest.fn();
const mockMessagesCreate = jest.fn();
const mockMessagesList = jest.fn();
const mockRunsCreate = jest.fn();
const mockRunsRetrieve = jest.fn();
const mockAssistantsRetrieve = jest.fn();

const mockOpenAIInstance = {
  beta: {
    threads: {
      create: mockThreadsCreate,
      messages: {
        create: mockMessagesCreate,
        list: mockMessagesList,
      },
      runs: {
        create: mockRunsCreate,
        retrieve: mockRunsRetrieve,
      },
    },
    assistants: {
      retrieve: mockAssistantsRetrieve,
    },
  },
};

// Mock OpenAI
jest.mock("openai", () => {
  const MockOpenAI = jest.fn().mockImplementation(() => mockOpenAIInstance);
  return {
    __esModule: true,
    default: MockOpenAI,
  };
});

// Mock env
jest.mock("../../config/env", () => ({
  env: {
    OPENAI_API_KEY: "test-api-key",
  },
}));

// Mock https-proxy-agent
jest.mock("https-proxy-agent", () => ({
  HttpsProxyAgent: jest.fn().mockImplementation(() => ({})),
}));

// Mock node-fetch
jest.mock("node-fetch", () => {
  return jest.fn();
});

describe("OpenAIClient", () => {
  let client: OpenAIClient;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Default: no proxy URL
    mockGetSetting.mockResolvedValue(null);

    // Create client instance with mocked SettingsRepository
    client = new OpenAIClient(mockSettingsRepository);
  });

  describe("createThread", () => {
    it("should create a new thread and return thread ID", async () => {
      const mockThread = { id: "thread_123" };
      mockThreadsCreate.mockResolvedValue(mockThread as any);

      const threadId = await client.createThread();

      expect(threadId).toBe("thread_123");
      expect(mockThreadsCreate).toHaveBeenCalledTimes(1);
    });

    it("should throw error when thread creation fails", async () => {
      const error = new Error("API error");
      mockThreadsCreate.mockRejectedValue(error);

      await expect(client.createThread()).rejects.toThrow(
        "Failed to create OpenAI thread",
      );
    });
  });

  describe("getAnswer", () => {
    const defaultParams = {
      assistantId: "assistant_123",
      messageText: "Hello, how are you?",
    };

    it("should create new thread when threadId is not provided", async () => {
      const mockThread = { id: "thread_new" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "I'm doing well, thank you!" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // First call during polling (checkRunStatus), second call after completion to get usage
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);
      mockAssistantsRetrieve.mockResolvedValue({
        model: "gpt-4o-mini",
      } as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.threadId).toBe("thread_new");
      expect(result.answer).toBe("I'm doing well, thank you!");
      expect(result.pricing).toBeDefined();
      expect(result.pricing?.model).toBe("gpt-4o-mini");
      expect(mockThreadsCreate).toHaveBeenCalledTimes(1);
    });

    it("should use existing thread when threadId is provided", async () => {
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response text" },
              },
            ],
          },
        ],
      };

      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // First call during polling (checkRunStatus), second call after completion to get usage
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);
      mockAssistantsRetrieve.mockResolvedValue({
        model: "gpt-4o-mini",
      } as any);

      const result = await client.getAnswer({
        ...defaultParams,
        threadId: "existing_thread_123",
      });

      expect(result.threadId).toBe("existing_thread_123");
      expect(result.answer).toBe("Response text");
      expect(mockThreadsCreate).not.toHaveBeenCalled();
    });

    it("should handle model override", async () => {
      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // First call during polling, second call after completion to get usage
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);

      await client.getAnswer({
        ...defaultParams,
        model: "gpt-4o",
      });

      expect(mockRunsCreate).toHaveBeenCalledWith(
        "thread_123",
        expect.objectContaining({
          assistant_id: "assistant_123",
          model: "gpt-4o",
        }),
      );
    });

    it("should calculate pricing correctly when usage is available", async () => {
      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 1000,
          completion_tokens: 500,
          total_tokens: 1500,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // First call during polling, second call after completion to get usage
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);
      mockAssistantsRetrieve.mockResolvedValue({
        model: "gpt-4o-mini",
      } as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.pricing).toBeDefined();
      expect(result.pricing?.inputTokens).toBe(1000);
      expect(result.pricing?.outputTokens).toBe(500);
      expect(result.pricing?.totalCost).toBeGreaterThan(0);
    });

    it("should return null pricing when usage is not available", async () => {
      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // First call during polling, second call after completion (no usage)
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: null,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.pricing).toBeNull();
    });

    it("should handle failed runs", async () => {
      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      mockRunsRetrieve.mockResolvedValue({
        id: "run_123",
        status: "failed",
        last_error: {
          message: "Run failed",
          code: "error_code",
        },
      } as any);

      await expect(client.getAnswer(defaultParams)).rejects.toThrow(
        "OpenAI run failed",
      );
    });

    it("should handle empty response text", async () => {
      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // First call during polling, second call after completion to get usage
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.answer).toBe("no answer from chatGPT");
      expect(result.pricing).toBeNull();
    });

    it("should handle API errors during message creation", async () => {
      const mockThread = { id: "thread_123" };
      const error = new Error("API rate limit");

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockRejectedValue(error);

      await expect(client.getAnswer(defaultParams)).rejects.toThrow(
        "OpenAI API error",
      );
    });

    it("should poll run status until completion", async () => {
      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      // Simulate polling: queued -> in_progress -> completed
      // Then one more call after completion to get usage
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "queued",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "in_progress",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);
      mockAssistantsRetrieve.mockResolvedValue({
        model: "gpt-4o-mini",
      } as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.answer).toBe("Response");
      // Should have polled multiple times until completion, then one more to get usage
      expect(mockRunsRetrieve).toHaveBeenCalledTimes(4);
    });
  });

  describe("proxy configuration", () => {
    it("should inject SettingsRepository in constructor", () => {
      const testClient = new OpenAIClient(mockSettingsRepository);
      expect(testClient).toBeDefined();
    });

    it("should work with proxy URL set", async () => {
      const proxyUrl = "http://proxy.example.com:8080";
      mockGetSetting.mockResolvedValue(proxyUrl);

      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);
      mockAssistantsRetrieve.mockResolvedValue({
        model: "gpt-4o-mini",
      } as any);

      const result = await client.getAnswer({
        assistantId: "assistant_123",
        messageText: "Hello",
      });

      expect(result.answer).toBe("Response");
      // Note: getSetting is called by the fetch function when OpenAI makes HTTP requests
      // Since we're mocking OpenAI SDK methods, the fetch function may not be called
      // The important thing is that the client is constructed correctly with SettingsRepository
    });

    it("should work without proxy URL (null)", async () => {
      mockGetSetting.mockResolvedValue(null);

      const mockThread = { id: "thread_123" };
      const mockMessage = { id: "msg_123" };
      const mockRun = {
        id: "run_123",
        status: "completed",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };
      const mockMessages = {
        data: [
          {
            id: "msg_assistant",
            role: "assistant",
            content: [
              {
                type: "text",
                text: { value: "Response" },
              },
            ],
          },
        ],
      };

      mockThreadsCreate.mockResolvedValue(mockThread as any);
      mockMessagesCreate.mockResolvedValue(mockMessage as any);
      mockRunsCreate.mockResolvedValue({
        id: "run_123",
        status: "queued",
      } as any);
      mockRunsRetrieve
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
        } as any)
        .mockResolvedValueOnce({
          id: "run_123",
          status: "completed",
          usage: mockRun.usage,
        } as any);
      mockMessagesList.mockResolvedValue(mockMessages as any);
      mockAssistantsRetrieve.mockResolvedValue({
        model: "gpt-4o-mini",
      } as any);

      const result = await client.getAnswer({
        assistantId: "assistant_123",
        messageText: "Hello",
      });

      expect(result.answer).toBe("Response");
      // Note: getSetting is called by the fetch function when OpenAI makes HTTP requests
      // Since we're mocking OpenAI SDK methods, the fetch function may not be called
      // The important thing is that the client is constructed correctly with SettingsRepository
    });
  });
});

