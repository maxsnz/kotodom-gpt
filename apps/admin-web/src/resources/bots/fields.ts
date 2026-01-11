import { Field } from "@kotoadmin/types/fields";
import { FieldType } from "../../../../../shared/packages/kotoadmin/src/types/fieldTypes";

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
    props: { required: true },
  },
  {
    key: "startMessage",
    label: "Start Message",
    type: FieldType.TEXT,
    props: { required: true },
    isVisible: {
      list: false,
      show: true,
      edit: true,
    },
  },

  {
    key: "errorMessage",
    label: "Error Message",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: true,
    },
  },
  {
    key: "model",
    label: "Model",
    type: FieldType.SELECT,
    options: [
      { label: "gpt-4o-mini", value: "gpt-4o-mini" },
      { label: "gpt-4.1-mini", value: "gpt-4.1-mini" },

      { label: "gpt-5-nano", value: "gpt-5-nano" },
      { label: "gpt-5-mini", value: "gpt-5-mini" },
    ],
    props: { required: true },
  },
  {
    key: "assistantId",
    label: "Assistant ID",
    type: FieldType.TEXT,
    props: { required: true },
    isVisible: {
      list: false,
      show: true,
      edit: true,
    },
  },
  {
    key: "enabled",
    label: "Enabled",
    type: FieldType.BOOLEAN,
    props: { required: true },
    isVisible: {
      list: false,
      show: true,
      edit: true,
    },
  },
  {
    key: "telegramMode",
    label: "Telegram Mode",
    type: FieldType.SELECT,
    options: [
      { label: "Webhook", value: "webhook" },
      { label: "Polling", value: "polling" },
    ],
    props: { required: true },
  },
  {
    key: "error",
    label: "Error",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "ownerUserId",
    label: "Owner User ID",
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
