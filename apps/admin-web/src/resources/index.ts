import users from "./users";
import bots from "./bots";
import chats from "./chats";
import tgUsers from "./tgUsers";
import messageProcessing from "./messageProcessing";
import { Resource } from "@kotoadmin/types/resource";

export const resources = [
  users,
  bots,
  chats,
  messageProcessing,
  tgUsers,
] satisfies Resource[];
