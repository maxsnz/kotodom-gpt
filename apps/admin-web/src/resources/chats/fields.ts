import { Field } from "@kotoadmin/types/fields";
import { FieldType } from "@kotoadmin/types/fieldTypes";

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
    key: "name",
    label: "Name",
    type: FieldType.TEXT,
    props: { required: false },
  },
  {
    key: "telegramChatId",
    label: "Telegram Chat ID",
    type: FieldType.TEXT,
    props: { required: true },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
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
    key: "threadId",
    label: "Thread ID",
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
