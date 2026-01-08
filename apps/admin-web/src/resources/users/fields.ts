import { Field } from "@/types/fields";
import { FieldType } from "../../types/fieldTypes";

const fields = [
  {
    key: "id",
    label: "ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
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
  {
    key: "status",
    label: "Status",
    type: FieldType.SELECT,
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
    props: { required: true },
  },
  {
    key: "createdAt",
    label: "Created At",
    type: FieldType.DATE,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "updatedAt",
    label: "Updated At",
    type: FieldType.DATE,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
] satisfies Field[];

export default fields;
