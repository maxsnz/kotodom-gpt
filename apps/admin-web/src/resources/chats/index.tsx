import { ChatResponseSchema } from "@shared/contracts/chats";
import { createItemResponseSchema } from "@/utils/responseSchemas";
import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";
import { createListResponseSchema } from "@/utils/responseSchemas";
import z from "zod";
import { config } from "../../../config";
// import ChatShowView from "@/components/ChatShowView";

const key = "chats";

const resource = {
  name: key,
  label: "Chats",
  fields,
  actions: [],

  routes: {
    list: { path: `${key}` },
    edit: { path: `${key}/edit/:id` },
    show: {
      path: `${key}/:id`,
      // component: <ChatShowView />,
      footerButtons: [
        {
          label: "View Messages",
          onClick: (event, { record, navigate }) => {
            event.preventDefault();
            if (!record || !navigate) return;
            navigate(`${config.basePath}/chats/${record.id}/messages`, {
              replace: true,
            });
          },
        },
      ],
    },
  },

  meta: {
    canDelete: true,
    canRead: true,
    canCreate: false,
  },

  api: {
    list: {
      path: "/chats",
      schema: createListResponseSchema(ChatResponseSchema),
    },
    item: {
      path: "/chats/:id",
      schema: createItemResponseSchema(ChatResponseSchema),
    },
    update: {
      path: "/chats/:id",
      schema: z.object({ chat: ChatResponseSchema }),
    },
    delete: {
      path: "/chats/:id",
      schema: z.object({ chat: ChatResponseSchema }),
    },
  },
} satisfies ResourceConfig;

export default resource;
