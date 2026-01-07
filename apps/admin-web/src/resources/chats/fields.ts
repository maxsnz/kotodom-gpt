import { FieldType } from "../../types/fieldTypes";

/*
        {
            "id": "17106641",
            "telegramChatId": "1710664",
            "botId": 1,
            "tgUserId": "1710664",
            "threadId": "thread_9iD4HCxyE8Z1LNI2CGjSDoyf",
            "name": "maxsnz vs Test assistant",
            "createdAt": "2025-09-01T15:12:40.968Z"
        }
            */

export const chatFields = [
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
  },
  {
    key: "botId",
    label: "Bot ID",
    type: FieldType.TEXT,
    props: { required: true },
  },
  {
    key: "tgUserId",
    label: "TG User ID",
    type: FieldType.TEXT,
    props: { required: true },
  },
  {
    key: "threadId",
    label: "Thread ID",
    type: FieldType.TEXT,
    props: { required: false },
  },
];
