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

interface BaseField {
  key: string;
  label: string;
  type: FieldType;
  props: FieldProps;
  isVisible?: FieldVisibility;
}

interface NotSelectField extends BaseField {
  type: Exclude<FieldType, typeof FieldTypeConst.SELECT>;
}

interface SelectField extends BaseField {
  type: typeof FieldTypeConst.SELECT;
  options: SelectOption[];
}

export type Field = NotSelectField | SelectField;

export type FormValues = Record<
  string,
  string | number | boolean | Date | null | undefined
>;
