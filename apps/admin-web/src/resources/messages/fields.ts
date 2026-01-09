import { Field } from "@kotoadmin/types/fields";
import { FieldType } from "@kotoadmin/types/fieldTypes";

/*
  id: z.number(),
  chatId: z.string().nullable(),
  tgUserId: z.string().nullable(),
  botId: z.number().nullable(),
  text: z.string(),
  userMessageId: z.number().nullable(),
  createdAt: z.string().datetime(),
*/

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
    key: "text",
    label: "Text",
    type: FieldType.TEXT,
    props: { required: false },
  },
  {
    key: "botId",
    label: "Bot ID",
    type: FieldType.TEXT,
    props: { required: true },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "tgUserId",
    label: "TG User ID",
    type: FieldType.TEXT,
    props: { required: true },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "userMessageId",
    label: "User Message ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
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
