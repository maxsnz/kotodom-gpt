import { FieldType } from "../../types/fieldTypes";

export const userFields = [
  {
    key: "email",
    label: "Email",
    type: FieldType.TEXT,
    props: { required: true },
  },
  {
    key: "role",
    label: "Role",
    type: FieldType.TEXT,
    props: { required: true },
  },
];
