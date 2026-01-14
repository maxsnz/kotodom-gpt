import { Resource } from "./resource";
import { NavigateFunction } from "react-router-dom";

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
  navigate: NavigateFunction;
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

export type ListActionContext = {
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

export type ListAction = {
  name: string;
  action: (context: ListActionContext) => void | Promise<void>;
  icon: React.ReactNode;
  color?: string;
  variant?: "filled" | "light" | "outline" | "subtle" | "default";
};
