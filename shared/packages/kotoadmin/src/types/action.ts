import { Resource } from "./resource";

export type ActionContext = {
  invalidate: (options: {
    resource: string;
    invalidates: ("list" | "detail" | "all")[];
  }) => Promise<void>;
  resource: Resource;
  openNotification: (options: {
    type: "success" | "error";
    message: string;
  }) => void;
};

export type Action = {
  name: string;
  action: (
    record: any,
    context: ActionContext
  ) => void | Promise<void>;
  available: (record: any) => boolean;
  icon: React.ReactNode;
};
