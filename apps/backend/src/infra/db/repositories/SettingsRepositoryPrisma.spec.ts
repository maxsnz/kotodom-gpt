import { SettingsRepositoryPrisma } from "./SettingsRepositoryPrisma";
import { prisma } from "../prisma/client";

// Mock Prisma client
jest.mock("../prisma/client", () => ({
  prisma: {
    setting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe("SettingsRepositoryPrisma", () => {
  let repository: SettingsRepositoryPrisma;
  let mockPrisma: jest.Mocked<typeof prisma>;

  beforeEach(() => {
    repository = new SettingsRepositoryPrisma();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    jest.clearAllMocks();
  });

  describe("getSetting", () => {
    it("should return value when setting exists", async () => {
      const prismaSetting = {
        id: "PROXY_URL",
        value: "http://proxy.example.com:8080",
      };

      mockPrisma.setting.findUnique.mockResolvedValue(prismaSetting as any);

      const result = await repository.getSetting("PROXY_URL");

      expect(result).toBe("http://proxy.example.com:8080");
      expect(mockPrisma.setting.findUnique).toHaveBeenCalledWith({
        where: { id: "PROXY_URL" },
      });
    });

    it("should return null when setting not found", async () => {
      mockPrisma.setting.findUnique.mockResolvedValue(null);

      const result = await repository.getSetting("NON_EXISTENT_KEY");

      expect(result).toBeNull();
      expect(mockPrisma.setting.findUnique).toHaveBeenCalledWith({
        where: { id: "NON_EXISTENT_KEY" },
      });
    });

    it("should return null when setting value is null", async () => {
      const prismaSetting = {
        id: "EMPTY_SETTING",
        value: null,
      };

      mockPrisma.setting.findUnique.mockResolvedValue(prismaSetting as any);

      const result = await repository.getSetting("EMPTY_SETTING");

      expect(result).toBeNull();
    });

    it("should return empty string when setting value is empty string", async () => {
      const prismaSetting = {
        id: "EMPTY_STRING_SETTING",
        value: "",
      };

      mockPrisma.setting.findUnique.mockResolvedValue(prismaSetting as any);

      const result = await repository.getSetting("EMPTY_STRING_SETTING");

      expect(result).toBe("");
    });
  });

  describe("setSetting", () => {
    it("should create new setting when it does not exist", async () => {
      mockPrisma.setting.upsert.mockResolvedValue({
        id: "NEW_KEY",
        value: "new-value",
      } as any);

      await repository.setSetting("NEW_KEY", "new-value");

      expect(mockPrisma.setting.upsert).toHaveBeenCalledWith({
        where: { id: "NEW_KEY" },
        update: { value: "new-value" },
        create: { id: "NEW_KEY", value: "new-value" },
      });
    });

    it("should update existing setting", async () => {
      mockPrisma.setting.upsert.mockResolvedValue({
        id: "EXISTING_KEY",
        value: "updated-value",
      } as any);

      await repository.setSetting("EXISTING_KEY", "updated-value");

      expect(mockPrisma.setting.upsert).toHaveBeenCalledWith({
        where: { id: "EXISTING_KEY" },
        update: { value: "updated-value" },
        create: { id: "EXISTING_KEY", value: "updated-value" },
      });
    });

    it("should handle empty string values", async () => {
      mockPrisma.setting.upsert.mockResolvedValue({
        id: "EMPTY_KEY",
        value: "",
      } as any);

      await repository.setSetting("EMPTY_KEY", "");

      expect(mockPrisma.setting.upsert).toHaveBeenCalledWith({
        where: { id: "EMPTY_KEY" },
        update: { value: "" },
        create: { id: "EMPTY_KEY", value: "" },
      });
    });

    it("should handle long string values", async () => {
      const longValue = "a".repeat(1000);
      mockPrisma.setting.upsert.mockResolvedValue({
        id: "LONG_KEY",
        value: longValue,
      } as any);

      await repository.setSetting("LONG_KEY", longValue);

      expect(mockPrisma.setting.upsert).toHaveBeenCalledWith({
        where: { id: "LONG_KEY" },
        update: { value: longValue },
        create: { id: "LONG_KEY", value: longValue },
      });
    });

    it("should handle special characters in value", async () => {
      const specialValue = "http://proxy.example.com:8080?user=test&pass=secret";
      mockPrisma.setting.upsert.mockResolvedValue({
        id: "SPECIAL_KEY",
        value: specialValue,
      } as any);

      await repository.setSetting("SPECIAL_KEY", specialValue);

      expect(mockPrisma.setting.upsert).toHaveBeenCalledWith({
        where: { id: "SPECIAL_KEY" },
        update: { value: specialValue },
        create: { id: "SPECIAL_KEY", value: specialValue },
      });
    });
  });
});

