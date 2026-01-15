export const FieldType = {
  EMAIL: "email",
  TEXT: "text",
  DATE: "date",
  BOOLEAN: "checkbox",
  SELECT: "select",
  RECORD_LINK: "record_link",
  LINK: "link",
  TEXTAREA: "textarea",
  JSON: "json",
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];
