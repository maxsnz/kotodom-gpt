import { enableBot, disableBot, restartBot } from "@/services/botService";
import { IconPower, IconRefresh } from "@tabler/icons-react";
import { ActionContext } from "@kotoadmin/types/action";

export const botActions = [
  {
    name: "Turn on",
    action: async (record: any, context: ActionContext) => {
      await enableBot(record.id);
      await context.invalidate({
        resource: context.resource.name,
        invalidates: ["list", "detail"],
      });
      context.openNotification({
        type: "success",
        message: "Bot enabled successfully",
      });
    },
    available: (record: any) => {
      return record.enabled === false;
    },
    icon: <IconPower size={16} color="green" />,
  },
  {
    name: "Turn off",
    action: async (record: any, context: ActionContext) => {
      await disableBot(record.id);
      await context.invalidate({
        resource: context.resource.name,
        invalidates: ["list", "detail"],
      });
      context.openNotification({
        type: "success",
        message: "Bot disabled successfully",
      });
    },
    available: (record: any) => {
      return record.enabled === true;
    },
    icon: <IconPower size={16} color="red" />,
  },
  {
    name: "Restart",
    action: async (record: any, context: ActionContext) => {
      await restartBot(record.id);
      await context.invalidate({
        resource: context.resource.name,
        invalidates: ["list", "detail"],
      });
    },
    icon: <IconRefresh size={16} />,
    available: (record: any) => {
      return record.enabled === true;
    },
  },
];
