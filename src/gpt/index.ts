import OpenAI from "openai";
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import createFetchWithProxy from "../utils/fetchWithProxy";

dotenv.config();

const customFetch = process.env.PROXY_URL
  ? createFetchWithProxy(process.env.PROXY_URL)
  : fetch;
class Gpt {
  instance: OpenAI;
  assistant: OpenAI.Beta.Assistants.Assistant | null;

  constructor() {
    this.instance = new OpenAI({
      // @ts-expect-error
      fetch: customFetch,
      // apiKey: process.env.OPENAI_API_KEY,
    });
    this.assistant = null;
  }
}

const gpt = new Gpt();

export default gpt;
