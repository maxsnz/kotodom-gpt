import { ComponentLoader } from "adminjs";

export const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add("Dashboard", "./Dashboard.tsx"),
  SendMessage: componentLoader.add(
    "SendMessage",
    "./SendMessage.tsx",
  ),
  ShowMessages: componentLoader.add(
    "ShowMessages",
    "./ShowMessages.tsx",
  ),
  ShowUserChats: componentLoader.add(
    "ShowUserChats",
    "./ShowUserChats.tsx",
  ),
};

export default Components;
