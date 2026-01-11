import { Field } from "./fields";
import { Action, ListAction } from "./action";
import { z } from "zod";
import getRouter from "../utils/getRouter";
import ResourceStore from "../utils/resourceStore";
import { BaseRecord } from "@refinedev/core";
import { NavigateFunction } from "react-router-dom";

export interface ResourceApiEndpointConfig {
  path: string;
  schema: z.ZodSchema;
  method?: "get" | "post" | "put" | "delete";
}

export interface ResourceRouteConfig {
  path: string;
  component?: React.ReactNode;
  footerButtons?: {
    label: string;
    onClick: (
      event: React.MouseEvent<HTMLButtonElement>,
      params: {
        resource?: Resource;
        record?: BaseRecord;
        navigate?: NavigateFunction;
      }
    ) => void;
  }[];
  // TODO role
}

export interface ResourceConfig {
  name: string;
  param?: string;
  label: string;
  fields: Field[];
  actions: Action[];
  listActions?: ListAction[];
  routes: {
    [key: string]: ResourceRouteConfig;
  };
  meta: {
    canDelete?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canRead?: boolean;
    hideInNavigation?: boolean;
    initialFilters?: Array<{ field: string; value: string | number | boolean }>;
  };

  api: { [key: string]: ResourceApiEndpointConfig };
}

export class Resource {
  private config: ResourceConfig;
  private basePath: string;

  constructor(config: ResourceConfig, basePath: string) {
    this.config = config;
    this.basePath = basePath;
  }

  get name(): string {
    return this.config.name;
  }

  get label(): string {
    return this.config.label;
  }

  get fields(): Field[] {
    return this.config.fields;
  }

  get actions(): Action[] {
    return this.config.actions;
  }

  get listActions(): ListAction[] {
    return this.config.listActions || [];
  }

  get routes() {
    return this.config.routes;
  }

  get meta() {
    return this.config.meta;
  }

  get api() {
    return this.config.api;
  }

  // Routes paths
  getEditPath(record: BaseRecord, pathParams?: Map<string, string>): string {
    let path = `${this.basePath}${this.config.routes.edit.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path.replace(":id", record.id?.toString() || "");
  }

  getShowPath(record: BaseRecord, pathParams?: Map<string, string>): string {
    let path = `${this.basePath}${this.config.routes.show.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path.replace(":id", record.id?.toString() || "");
  }

  getListPath(pathParams?: Map<string, string>): string {
    let path = `${this.basePath}${this.config.routes.list.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path;
  }

  getCreatePath(pathParams?: Map<string, string>): string {
    let path = `${this.basePath}${this.config.routes.create.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path;
  }

  // API paths

  getApiListPath(pathParams?: Map<string, string>): string {
    let path = this.config.api.list?.path || `/${this.config.name}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path;
  }

  getApiItemPath(
    id: string | number,
    pathParams?: Map<string, string>
  ): string {
    let path = this.config.api.item?.path || `/${this.config.name}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${path.replace(":id", id.toString())}`;
  }

  getApiUpdatePath(
    id: string | number,
    pathParams?: Map<string, string>
  ): string {
    let path = this.config.api.update?.path || `/${this.config.name}/${id}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${path.replace(":id", id.toString())}`;
  }

  getApiDeletePath(
    id: string | number,
    pathParams?: Map<string, string>
  ): string {
    let path = this.config.api.delete?.path || `/${this.config.name}/${id}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${path.replace(":id", id.toString())}`;
  }

  getApiCreatePath(pathParams?: Map<string, string>): string {
    let path = this.config.api.create?.path || `/${this.config.name}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${this.basePath}${path}`;
  }

  getRouter(resourceStore: ResourceStore): React.ReactNode {
    return getRouter(this, resourceStore);
  }
}
