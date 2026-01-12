import users from "./users";
import bots from "./bots";
import chats from "./chats";
import tgUsers from "./tgUsers";
import messageProcessing from "./messageProcessing";
import messages from "./messages";
import { ResourceConfig } from "@kotoadmin/types/resource";
import ResourceStore from "@kotoadmin/utils/resourceStore";
import { config } from "@/config";

export const resources = [
  users,
  bots,
  chats,
  messages,
  messageProcessing,
  tgUsers,
] satisfies ResourceConfig[];

export const resourceStore = new ResourceStore(resources, config.basePath);
