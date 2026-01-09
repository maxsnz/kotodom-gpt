import { Field } from "@kotoadmin/types/fields";
import { FieldType } from "@kotoadmin/types/fieldTypes";

const fields = [
  {
    key: "id",
    label: "ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: true,
      show: true,
      edit: false,
    },
  },
  {
    key: "username",
    label: "Username",
    type: FieldType.TEXT,
    props: { required: false },
  },
  {
    key: "name",
    label: "Name",
    type: FieldType.TEXT,
    props: { required: false },
  },
  {
    key: "fullName",
    label: "Full Name",
    type: FieldType.TEXT,
    props: { required: false },
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
] satisfies Field[];

export default fields;
