import { FieldType } from "../../types/fieldTypes";

/*
"name": "Test assistant",
"startMessage": "This is a start message",
"errorMessage": "some error occured, see logs",
"model": "gpt-4.1-mini",
"assistantId": "asst_Tbi4RuAMhSvI5p5hK9e8MPbk",
"enabled": false,
"telegramMode": "webhook",
"error": "",
"ownerUserId": null
*/

export const botFields = [
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
    type: FieldType.TEXT,
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
];
