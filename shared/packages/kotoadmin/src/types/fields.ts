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

interface BooleanField extends BaseField {
  type: typeof FieldTypeConst.BOOLEAN;
}

interface DateField extends BaseField {
  type: typeof FieldTypeConst.DATE;
}

interface EmailField extends BaseField {
  type: typeof FieldTypeConst.EMAIL;
}

interface TextField extends BaseField {
  type: typeof FieldTypeConst.TEXT;
}

interface SelectField extends BaseField {
  type: typeof FieldTypeConst.SELECT;
  options: SelectOption[];
}

interface LinkField extends BaseField {
  type: typeof FieldTypeConst.LINK;
  url: string;
}

interface TextareaField extends BaseField {
  type: typeof FieldTypeConst.TEXTAREA;
}

interface RecordLinkField extends BaseField {
  type: typeof FieldTypeConst.RECORD_LINK;
  resource: string;
}

export type Field =
  | BooleanField
  | DateField
  | EmailField
  | TextField
  | SelectField
  | LinkField
  | RecordLinkField
  | TextareaField;

export type FormValues = Record<
  string,
  string | number | boolean | Date | null | undefined
>;
