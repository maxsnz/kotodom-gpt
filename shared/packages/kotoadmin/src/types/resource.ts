import { Field } from "./fields";
import { Action } from "./action";
import { z } from "zod";
import getRouter from "../utils/getRouter";
import ResourceStore from "../utils/resourceStore";

export interface ResourceConfig {
  name: string;
  param?: string;
  label: string;
  fields: Field[];
  actions: Action[];
  routes: {
    [key: string]: {
      path: string;
      component?: React.ReactNode;
      // TODO role
    };
  };
  meta: {
    canDelete: boolean;
  };
  schemas: {
    list?: z.ZodSchema;
    item?: z.ZodSchema;
    create?: z.ZodSchema;
    update?: z.ZodSchema;
  };

  api: {
    list?: string;
    item?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
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

  get routes(): {
    [key: string]: {
      path: string;
      component?: React.ReactNode;
      // TODO role
    };
  } {
    return this.config.routes;
  }

  get meta(): {
    canDelete: boolean;
  } {
    return this.config.meta;
  }

  get schemas() {
    return this.config.schemas;
  }

  get api(): {
    list?: string;
    item?: string;
    create?: string;
    update?: string;
    delete?: string;
  } {
    return this.config.api;
  }

  get param(): string {
    return this.config.param || "id";
  }

  // Routes paths

  getEditPath(
    record: { id: string | number },
    pathParams?: Map<string, string>
  ): string {
    let path = `${this.basePath}${this.config.routes.edit.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path.replace(`:${this.param}`, record.id.toString());
  }

  getShowPath(
    record: { id: string | number },
    pathParams?: Map<string, string>
  ): string {
    let path = `${this.basePath}${this.config.routes.show.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path.replace(`:${this.param}`, record.id.toString());
  }

  getListPath(pathParams?: Map<string, string>): string {
    let path = `${this.basePath}${this.config.routes.list.path}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path;
  }

  // API paths

  getApiListPath(pathParams?: Map<string, string>): string {
    let path = this.config.api.list || `/${this.config.name}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return path;
  }

  getApiItemPath(
    id: string | number,
    pathParams?: Map<string, string>
  ): string {
    let path = this.config.api.item || `/${this.config.name}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${path.replace(":id", id.toString())}`;
  }

  getApiUpdatePath(
    id: string | number,
    pathParams?: Map<string, string>
  ): string {
    let path = this.config.api.update || `/${this.config.name}/${id}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${path.replace(":id", id.toString())}`;
  }

  getApiDeletePath(
    id: string | number,
    pathParams?: Map<string, string>
  ): string {
    let path = this.config.api.delete || `/${this.config.name}/${id}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${path.replace(":id", id.toString())}`;
  }

  getApiCreatePath(pathParams?: Map<string, string>): string {
    let path = this.config.api.create || `/${this.config.name}`;

    for (const [param, value] of pathParams?.entries() ?? []) {
      path = path.replace(`:${param}`, value);
    }

    return `${this.basePath}${path}`;
  }

  getRouter(resourceStore: ResourceStore): React.ReactNode {
    return getRouter(this, resourceStore);
  }
}
