import { File } from "formidable";
import { Context, BaseRequest } from "koa";

interface Session {
  adminUser?: {
    email?: string;
  };
}

interface KoaBodyRequest extends BaseRequest {
  body: {
    [key: string]: unknown;
  };
}

interface KoaFilesRequest extends KoaBodyRequest {
  files: {
    [key: string]: File;
  };
}

declare module "koa" {
  interface ContextWithSession extends Context {
    session: Session;
  }
  interface ContextWithRequest extends Context {
    request: KoaBodyRequest | KoaFilesRequest;
  }
}
