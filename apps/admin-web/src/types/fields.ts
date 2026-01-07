import type { FieldType } from "./fieldTypes";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  props: any;
};
