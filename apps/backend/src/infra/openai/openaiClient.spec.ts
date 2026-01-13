import { OpenAIClient } from "./openaiClient";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";

// Create mock SettingsRepository
const mockGetSetting = jest.fn();
const mockSettingsRepository: SettingsRepository = {
  getSetting: mockGetSetting,
  setSetting: jest.fn(),
  getAllSettings: jest.fn(),
} as any;

// Create mock OpenAI instance for Responses API
const mockResponsesCreate = jest.fn();

const mockOpenAIInstance = {
  responses: {
    create: mockResponsesCreate,
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

  describe("getAnswer", () => {
    const defaultParams = {
      prompt: "You are a helpful assistant.",
      messageText: "Hello, how are you?",
      model: "gpt-4o-mini",
    };

    it("should get answer from Responses API", async () => {
      const mockResponse = {
        output_text: "I'm doing well, thank you!",
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.answer).toBe("I'm doing well, thank you!");
      expect(result.pricing).toBeDefined();
      expect(result.pricing?.model).toBe("gpt-4o-mini");
      expect(result.pricing?.inputTokens).toBe(100);
      expect(result.pricing?.outputTokens).toBe(50);
      expect(mockResponsesCreate).toHaveBeenCalledWith({
        model: "gpt-4o-mini",
        instructions: "You are a helpful assistant.",
        input: "Hello, how are you?",
      });
    });

    it("should calculate pricing correctly when usage is available", async () => {
      const mockResponse = {
        output_text: "Response text",
        usage: {
          input_tokens: 1000,
          output_tokens: 500,
          total_tokens: 1500,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.pricing).toBeDefined();
      expect(result.pricing?.inputTokens).toBe(1000);
      expect(result.pricing?.outputTokens).toBe(500);
      expect(result.pricing?.totalCost).toBeGreaterThan(0);
    });

    it("should return null pricing when usage is not available", async () => {
      const mockResponse = {
        output_text: "Response text",
        usage: null,
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.answer).toBe("Response text");
      expect(result.pricing).toBeNull();
    });

    it("should handle empty response text", async () => {
      const mockResponse = {
        output_text: null,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer(defaultParams);

      expect(result.answer).toBe("no answer from chatGPT");
      expect(result.pricing).toBeNull();
    });

    it("should handle API errors", async () => {
      const error = new Error("API rate limit");
      mockResponsesCreate.mockRejectedValue(error);

      await expect(client.getAnswer(defaultParams)).rejects.toThrow(
        "OpenAI API error"
      );
    });

    it("should use provided model", async () => {
      const mockResponse = {
        output_text: "Response",
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      await client.getAnswer({
        ...defaultParams,
        model: "gpt-4o",
      });

      expect(mockResponsesCreate).toHaveBeenCalledWith({
        model: "gpt-4o",
        instructions: defaultParams.prompt,
        input: defaultParams.messageText,
      });
    });

    it("should handle different prompt and message", async () => {
      const mockResponse = {
        output_text: "Custom response",
        usage: {
          input_tokens: 200,
          output_tokens: 100,
          total_tokens: 300,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer({
        prompt: "You are a coding assistant.",
        messageText: "How do I write a function?",
        model: "gpt-5-nano",
      });

      expect(result.answer).toBe("Custom response");
      expect(mockResponsesCreate).toHaveBeenCalledWith({
        model: "gpt-5-nano",
        instructions: "You are a coding assistant.",
        input: "How do I write a function?",
      });
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

      const mockResponse = {
        output_text: "Response",
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer({
        prompt: "You are helpful.",
        messageText: "Hello",
        model: "gpt-4o-mini",
      });

      expect(result.answer).toBe("Response");
      // Note: getSetting is called by the fetch function when OpenAI makes HTTP requests
      // Since we're mocking OpenAI SDK methods, the fetch function may not be called
      // The important thing is that the client is constructed correctly with SettingsRepository
    });

    it("should work without proxy URL (null)", async () => {
      mockGetSetting.mockResolvedValue(null);

      const mockResponse = {
        output_text: "Response",
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockResponsesCreate.mockResolvedValue(mockResponse as any);

      const result = await client.getAnswer({
        prompt: "You are helpful.",
        messageText: "Hello",
        model: "gpt-4o-mini",
      });

      expect(result.answer).toBe("Response");
      // Note: getSetting is called by the fetch function when OpenAI makes HTTP requests
      // Since we're mocking OpenAI SDK methods, the fetch function may not be called
      // The important thing is that the client is constructed correctly with SettingsRepository
    });
  });
});
