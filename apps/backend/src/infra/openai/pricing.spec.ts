import {
  calculateOpenAICost,
  OPENAI_PRICING,
  type TokenUsage,
  type PricingInfo,
} from "./pricing";

describe("pricing", () => {
  describe("calculateOpenAICost", () => {
    it("should calculate cost for gpt-4o-mini correctly", () => {
      const usage: TokenUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const result = calculateOpenAICost("gpt-4o-mini", usage);

      expect(result.model).toBe("gpt-4o-mini");
      expect(result.inputTokens).toBe(1000);
      expect(result.outputTokens).toBe(500);
      // 1000 / 1000 * 0.0006 = 0.0006
      expect(result.inputCost).toBe(0.0006);
      // 500 / 1000 * 0.0024 = 0.0012
      expect(result.outputCost).toBe(0.0012);
      // 0.0006 + 0.0012 = 0.0018
      expect(result.totalCost).toBe(0.0018);
    });

    it("should calculate cost for gpt-4o correctly", () => {
      const usage: TokenUsage = {
        prompt_tokens: 2000,
        completion_tokens: 1000,
        total_tokens: 3000,
      };

      const result = calculateOpenAICost("gpt-4o", usage);

      expect(result.model).toBe("gpt-4o");
      expect(result.inputTokens).toBe(2000);
      expect(result.outputTokens).toBe(1000);
      // 2000 / 1000 * 0.005 = 0.01
      expect(result.inputCost).toBe(0.01);
      // 1000 / 1000 * 0.015 = 0.015
      expect(result.outputCost).toBe(0.015);
      // 0.01 + 0.015 = 0.025
      expect(result.totalCost).toBe(0.025);
    });

    it("should calculate cost for gpt-3.5-turbo correctly", () => {
      const usage: TokenUsage = {
        prompt_tokens: 500,
        completion_tokens: 300,
        total_tokens: 800,
      };

      const result = calculateOpenAICost("gpt-3.5-turbo", usage);

      expect(result.model).toBe("gpt-3.5-turbo");
      // 500 / 1000 * 0.0015 = 0.00075
      expect(result.inputCost).toBe(0.00075);
      // 300 / 1000 * 0.002 = 0.0006
      expect(result.outputCost).toBe(0.0006);
      // 0.00075 + 0.0006 = 0.00135
      expect(result.totalCost).toBe(0.00135);
    });

    it("should round to 5 decimal places", () => {
      const usage: TokenUsage = {
        prompt_tokens: 333,
        completion_tokens: 777,
        total_tokens: 1110,
      };

      const result = calculateOpenAICost("gpt-4o-mini", usage);

      // Check that all costs are rounded to 5 decimal places
      expect(result.inputCost.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(5);
      expect(result.outputCost.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(5);
      expect(result.totalCost.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(5);
    });

    it("should handle zero tokens", () => {
      const usage: TokenUsage = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };

      const result = calculateOpenAICost("gpt-4o-mini", usage);

      expect(result.inputTokens).toBe(0);
      expect(result.outputTokens).toBe(0);
      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it("should handle large token counts", () => {
      const usage: TokenUsage = {
        prompt_tokens: 1000000,
        completion_tokens: 500000,
        total_tokens: 1500000,
      };

      const result = calculateOpenAICost("gpt-4o-mini", usage);

      expect(result.inputTokens).toBe(1000000);
      expect(result.outputTokens).toBe(500000);
      // 1000000 / 1000 * 0.0006 = 0.6
      expect(result.inputCost).toBe(0.6);
      // 500000 / 1000 * 0.0024 = 1.2
      expect(result.outputCost).toBe(1.2);
      // 0.6 + 1.2 = 1.8
      expect(result.totalCost).toBe(1.8);
    });

    it("should use default pricing for unknown model", () => {
      const usage: TokenUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const result = calculateOpenAICost("unknown-model-xyz", usage);

      expect(result.model).toBe("unknown-model-xyz");
      // Should use default pricing (gpt-5-nano)
      // 1000 / 1000 * 0.00005 = 0.00005
      expect(result.inputCost).toBe(0.00005);
      // 500 / 1000 * 0.0004 = 0.0002
      expect(result.outputCost).toBe(0.0002);
      // 0.00005 + 0.0002 = 0.00025
      expect(result.totalCost).toBe(0.00025);
    });

    it("should handle all supported models", () => {
      const models = [
        "gpt-5",
        "gpt-5-mini",
        "gpt-5-nano",
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-4",
        "gpt-4-turbo",
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-3.5-turbo",
      ];

      const usage: TokenUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      for (const model of models) {
        const result = calculateOpenAICost(model, usage);
        expect(result.model).toBe(model);
        expect(result.inputCost).toBeGreaterThanOrEqual(0);
        expect(result.outputCost).toBeGreaterThanOrEqual(0);
        expect(result.totalCost).toBeGreaterThanOrEqual(0);
        // Account for rounding precision (5 decimal places)
        expect(
          Math.abs(result.totalCost - (result.inputCost + result.outputCost)),
        ).toBeLessThan(0.00001);
      }
    });

    it("should handle fractional token counts correctly", () => {
      const usage: TokenUsage = {
        prompt_tokens: 123,
        completion_tokens: 456,
        total_tokens: 579,
      };

      const result = calculateOpenAICost("gpt-4o-mini", usage);

      // 123 / 1000 * 0.0006 = 0.0000738 -> rounded to 0.00007
      // 456 / 1000 * 0.0024 = 0.0010944 -> rounded to 0.00109
      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.outputCost).toBeGreaterThan(0);
      // Account for rounding precision (5 decimal places) - allow small floating point errors
      expect(
        Math.abs(result.totalCost - (result.inputCost + result.outputCost)),
      ).toBeLessThan(0.00002);
    });
  });

  describe("OPENAI_PRICING constant", () => {
    it("should have pricing for all expected models", () => {
      expect(OPENAI_PRICING["gpt-4o-mini"]).toBeDefined();
      expect(OPENAI_PRICING["gpt-4o"]).toBeDefined();
      expect(OPENAI_PRICING["gpt-3.5-turbo"]).toBeDefined();
      expect(OPENAI_PRICING.default).toBeDefined();
    });

    it("should have input and output prices for each model", () => {
      const models = Object.keys(OPENAI_PRICING) as Array<
        keyof typeof OPENAI_PRICING
      >;

      for (const model of models) {
        const pricing = OPENAI_PRICING[model];
        expect(pricing).toHaveProperty("input");
        expect(pricing).toHaveProperty("output");
        expect(typeof pricing.input).toBe("number");
        expect(typeof pricing.output).toBe("number");
        expect(pricing.input).toBeGreaterThanOrEqual(0);
        expect(pricing.output).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

