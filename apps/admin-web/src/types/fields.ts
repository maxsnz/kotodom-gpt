import type { FieldType } from "./fieldTypes";
import { FieldType as FieldTypeConst } from "./fieldTypes";

export type FieldProps = {
  required?: boolean;
  // Add other common props as needed
};

export type FieldVisibility = {
  list?: boolean;
  show?: boolean;
  edit?: boolean;
};

type SelectOption = { label: string; value: string };

type BaseField = {
  key: string;
  label: string;
  type: Exclude<FieldType, typeof FieldTypeConst.SELECT>;
  props: FieldProps;
  isVisible?: FieldVisibility;
};

type SelectField = {
  key: string;
  label: string;
  type: typeof FieldTypeConst.SELECT;
  props: FieldProps;
  options: SelectOption[];
  isVisible?: FieldVisibility;
};

export type Field = BaseField | SelectField;

export type FormValues = Record<
  string,
  string | number | boolean | null | undefined
>;
