import fetch, {
  RequestInfo,
  RequestInit,
  Response,
} from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

function createFetchWithProxy(proxyUrl: string) {
  const agent = new HttpsProxyAgent(proxyUrl);

  return function (
    url: RequestInfo,
    options?: RequestInit,
  ): Promise<Response> {
    const modifiedOptions = {
      ...options,
      agent,
    };

    return fetch(url, modifiedOptions);
  };
}

export default createFetchWithProxy;
