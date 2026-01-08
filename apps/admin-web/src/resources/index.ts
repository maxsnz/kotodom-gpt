import users from "./users";
import bots from "./bots";
import chats from "./chats";
import messageProcessing from "./messageProcessing";
import { Resource } from "@/types/resource";

export const resources = [
  users,
  bots,
  chats,
  messageProcessing,
] satisfies Resource[];
