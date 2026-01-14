import { IconMessage } from "@tabler/icons-react";
import { ActionContext } from "@kotoadmin/types/action";
import { config } from "@/config";

export const chatActions = [
  {
    name: "View Messages",
    action: async (record: any, context: ActionContext) => {
      context.navigate(`${config.basePath}/chats/${record.id}/messages`, {
        replace: true,
      });
    },
    available: (record: any) => {
      return !!record?.id;
    },
    icon: <IconMessage size={16} />,
  },
];
