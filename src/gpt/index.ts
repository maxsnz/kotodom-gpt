import OpenAI from "openai";
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getSetting } from "../utils/settings";

dotenv.config();

class Gpt {
  instance: OpenAI;
  assistant: OpenAI.Beta.Assistants.Assistant | null;
  private proxyUrl: string | null = null;

  constructor() {
    this.instance = new OpenAI({
      // @ts-expect-error
      fetch: this.createFetch(),
    });
    this.assistant = null;
    this.initializeProxy();
  }

  private createFetch() {
    return async (url: string, init?: any) => {
      const proxyUrl =
        this.proxyUrl || (await getSetting("PROXY_URL"));
      if (proxyUrl) {
        const agent = new HttpsProxyAgent(proxyUrl);
        return fetch(url, { ...init, agent });
      }
      return fetch(url, init);
    };
  }

  private async initializeProxy() {
    const proxyUrl = await getSetting("PROXY_URL");
    if (proxyUrl) {
      this.proxyUrl = proxyUrl;
      this.instance = new OpenAI({
        // @ts-expect-error
        fetch: this.createFetch(),
      });
    }
  }

  async updateProxyUrl(url: string) {
    this.proxyUrl = url;
    this.instance = new OpenAI({
      // @ts-expect-error
      fetch: this.createFetch(),
    });
  }
}

const gpt = new Gpt();

export default gpt;
