import { Field } from "./fields";
import { Action } from "./action";
import { z } from "zod";

export type Resource = {
  name: string;
  label: string;
  fields: Field[];
  actions: readonly Action[];
  list?: string;
  create?: string;
  edit?: string;
  show?: string;
  meta: {
    canDelete: boolean;
  };
  schemas: {
    list?: z.ZodSchema;
    item?: z.ZodSchema;
    create?: z.ZodSchema;
    update?: z.ZodSchema;
  };
};
