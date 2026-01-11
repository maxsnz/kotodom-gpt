import { FieldType } from "@kotoadmin/types/fieldTypes";
import { Field } from "@kotoadmin/types/fields";

/*
id: z.number(),
userMessageId: z.number(),
status: MessageProcessingStatusSchema,
attempts: z.number(),
lastError: z.string().nullable(),
lastErrorAt: z.string().datetime().nullable(),
terminalReason: z.string().nullable(),
responseMessageId: z.number().nullable(),
telegramIncomingMessageId: z.number().nullable(),
telegramOutgoingMessageId: z.number().nullable(),
telegramUpdateId: z.string().nullable(), // BigInt as string
responseGeneratedAt: z.string().datetime().nullable(),
responseSentAt: z.string().datetime().nullable(),
price: z.string(), // Decimal as string
createdAt: z.string().datetime(),
updatedAt: z.string().datetime(),
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
    key: "status",
    label: "Status",
    type: FieldType.SELECT,
    options: [
      { label: "Received", value: "RECEIVED" },
      { label: "Processing", value: "PROCESSING" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Failed", value: "FAILED" },
      { label: "Terminal", value: "TERMINAL" },
    ],
    props: { required: false },
  },
  {
    key: "attempts",
    label: "Attempts",
    type: FieldType.TEXT,
    props: { required: false },
  },
  {
    key: "lastError",
    label: "Last Error",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "lastErrorAt",
    label: "Last Error At",
    type: FieldType.DATE,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "terminalReason",
    label: "Terminal Reason",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "responseMessageId",
    label: "Response Message ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "telegramIncomingMessageId",
    label: "Telegram Incoming Message ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "telegramOutgoingMessageId",
    label: "Telegram Outgoing Message ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "telegramUpdateId",
    label: "Telegram Update ID",
    type: FieldType.TEXT,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "responseGeneratedAt",
    label: "Response Generated At",
    type: FieldType.DATE,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "responseSentAt",
    label: "Response Sent At",
    type: FieldType.DATE,
    props: { required: false },
    isVisible: {
      list: false,
      show: true,
      edit: false,
    },
  },
  {
    key: "price",
    label: "Price",
    type: FieldType.TEXT,
    props: { required: false },
  },
  {
    key: "createdAt",
    label: "Created At",
    type: FieldType.DATE,
    props: { required: false },
  },
  {
    key: "updatedAt",
    label: "Updated At",
    type: FieldType.DATE,
    props: { required: false },
  },
] satisfies Field[];

export default fields;
