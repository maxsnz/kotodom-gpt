import fetch, {
  RequestInfo,
  RequestInit,
  Response,
} from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

function createFetchWithProxy(proxyUrl: string) {
  return function (
    url: RequestInfo,
    options?: RequestInit,
  ): Promise<Response> {
    const modifiedOptions = options || {};

    // Если URL требует обращения через прокси
    modifiedOptions.agent = new HttpsProxyAgent(proxyUrl);

    return fetch(url, modifiedOptions);
  };
}

export default createFetchWithProxy;
