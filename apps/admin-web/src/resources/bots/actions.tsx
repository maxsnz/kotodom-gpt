import { enableBot, disableBot } from "@/services/botService";
import { IconPower } from "@tabler/icons-react";

export const botActions = [
  {
    name: "Turn on",
    action: async (record: any) => {
      await enableBot(record.id);
    },
    available: (record: any) => {
      return record.enabled === false;
    },
    icon: <IconPower size={16} color="green" />,
  },
  {
    name: "Turn off",
    action: async (record: any) => {
      await disableBot(record.id);
    },
    available: (record: any) => {
      return record.enabled === true;
    },
    icon: <IconPower size={16} color="red" />,
  },
];
