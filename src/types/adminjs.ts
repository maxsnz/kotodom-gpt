// AdminJS type definitions
export interface AdminJSContext {
  record: {
    params: Record<string, any>;
    toJSON: (admin: any) => any;
  };
  resource: {
    _decorated?: { id: () => string };
    id: () => string;
  };
  currentAdmin: any;
  h: {
    resourceUrl: (options: { resourceId: string }) => string;
  };
}

export interface AdminJSRequest {
  [key: string]: any;
}

export interface AdminJSResponse {
  [key: string]: any;
}

export interface AdminJSHandler {
  (
    request: AdminJSRequest,
    response: AdminJSResponse,
    context: AdminJSContext,
  ): Promise<{
    record: any;
    redirectUrl: string;
    notice: {
      message: string;
      type: "success" | "error";
    };
  }>;
}
