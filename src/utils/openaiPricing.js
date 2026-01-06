"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_PRICING = void 0;
exports.calculateOpenAICost = calculateOpenAICost;
exports.extractModelFromAssistant = extractModelFromAssistant;
// OpenAI API pricing per 1K tokens (Updated with fresh data)
// Prices are in USD - converted from per 1M tokens to per 1K tokens
exports.OPENAI_PRICING = {
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
};
/**
 * Calculate the cost of OpenAI API usage based on model and token usage
 */
function calculateOpenAICost(model, usage) {
    // Get pricing for the model, fallback to default if not found
    var pricing = exports.OPENAI_PRICING[model] ||
        exports.OPENAI_PRICING.default;
    var inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    var outputCost = (usage.completion_tokens / 1000) * pricing.output;
    var totalCost = inputCost + outputCost;
    return {
        model: model,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        inputCost: Math.round(inputCost * 100000) / 100000, // Round to 5 decimal places
        outputCost: Math.round(outputCost * 100000) / 100000,
        totalCost: Math.round(totalCost * 100000) / 100000,
    };
}
/**
 * Extract model name from assistant or run information
 * This is a fallback since OpenAI doesn't always provide model info in usage
 */
function extractModelFromAssistant(assistantId, gptInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var assistant, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, gptInstance.beta.assistants.retrieve(assistantId)];
                case 1:
                    assistant = _a.sent();
                    if (assistant.model) {
                        return [2 /*return*/, assistant.model];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.warn("Could not fetch assistant model, using default:", error_1);
                    return [3 /*break*/, 3];
                case 3: 
                // Fallback to default model
                return [2 /*return*/, "gpt-5-nano"]; // Default to most cost-effective model
            }
        });
    });
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
