// OpenAI API pricing per 1K tokens (Updated with fresh data)
// Prices are in USD - converted from per 1M tokens to per 1K tokens
export const OPENAI_PRICING = {
  // GPT-5 models (latest)
  "gpt-5": {
    input: 0.00125, // $1.25 per 1M tokens = $0.00125 per 1K tokens
    output: 0.01, // $10.00 per 1M tokens = $0.01 per 1K tokens
  },
  "gpt-5-mini": {
    input: 0.00025, // $0.25 per 1M tokens = $0.00025 per 1K tokens
    output: 0.002, // $2.00 per 1M tokens = $0.002 per 1K tokens
  },
  "gpt-5-nano": {
    input: 0.00005, // $0.05 per 1M tokens = $0.00005 per 1K tokens
    output: 0.0004, // $0.40 per 1M tokens = $0.0004 per 1K tokens
  },

  // GPT-4.1 models
  "gpt-4.1": {
    input: 0.003, // $3.00 per 1M tokens = $0.003 per 1K tokens
    output: 0.012, // $12.00 per 1M tokens = $0.012 per 1K tokens
  },
  "gpt-4.1-mini": {
    input: 0.0008, // $0.80 per 1M tokens = $0.0008 per 1K tokens
    output: 0.0032, // $3.20 per 1M tokens = $0.0032 per 1K tokens
  },
  "gpt-4.1-nano": {
    input: 0.0002, // $0.20 per 1M tokens = $0.0002 per 1K tokens
    output: 0.0008, // $0.80 per 1M tokens = $0.0008 per 1K tokens
  },

  // Legacy GPT-4 models (keep for backward compatibility)
  "gpt-4": {
    input: 0.03, // $0.03 per 1K input tokens
    output: 0.06, // $0.06 per 1K output tokens
  },
  "gpt-4-turbo": {
    input: 0.01, // $0.01 per 1K input tokens
    output: 0.03, // $0.03 per 1K output tokens
  },
  "gpt-4o": {
    input: 0.005, // $0.005 per 1K input tokens
    output: 0.015, // $0.015 per 1K output tokens
  },
  "gpt-4o-mini": {
    input: 0.0006, // $0.60 per 1M tokens = $0.0006 per 1K tokens
    output: 0.0024, // $2.40 per 1M tokens = $0.0024 per 1K tokens
  },

  // GPT-3.5 models
  "gpt-3.5-turbo": {
    input: 0.0015, // $0.0015 per 1K input tokens
    output: 0.002, // $0.002 per 1K output tokens
  },

  // Default fallback (GPT-5-nano pricing - most cost-effective)
  default: {
    input: 0.00005,
    output: 0.0004,
  },
} as const;

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface PricingInfo {
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * Calculate the cost of OpenAI API usage based on model and token usage
 */
export function calculateOpenAICost(
  model: string,
  usage: TokenUsage
): PricingInfo {
  // Get pricing for the model, fallback to default if not found
  const pricing =
    OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] ||
    OPENAI_PRICING.default;

  const inputCost = (usage.input_tokens / 1000) * pricing.input;
  const outputCost = (usage.output_tokens / 1000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    model,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    inputCost: Math.round(inputCost * 100000) / 100000, // Round to 5 decimal places
    outputCost: Math.round(outputCost * 100000) / 100000,
    totalCost: Math.round(totalCost * 100000) / 100000,
  };
}

/**
 * IMPORTANT: Verify current pricing at https://openai.com/pricing
 *
 * To update prices:
 * 1. Visit https://openai.com/pricing
 * 2. Find the current rates for each model
 * 3. Update the OPENAI_PRICING object above
 * 4. Test with a real API call to verify
 *
 * Common price changes:
 * - GPT-4o-mini: Often around $0.0003/$0.0012 per 1K tokens
 * - GPT-4o: Around $0.005/$0.015 per 1K tokens
 * - Prices can change frequently, especially for newer models
 */
