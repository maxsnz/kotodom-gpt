export const FieldType = {
  EMAIL: "email",
  TEXT: "text",
  DATE: "date",
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];
