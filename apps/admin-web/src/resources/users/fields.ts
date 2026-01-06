import { FieldType } from "../../types/fieldTypes";

export const userFields = [
  {
    key: "email",
    label: "Email",
    type: FieldType.TEXT,
    props: { required: true },
    header: "Email",
    accessorKey: "email",
  },
  {
    key: "name",
    label: "Name",
    type: FieldType.TEXT,
    props: { required: true },
    header: "Name",
    accessorKey: "name",
  },
];
