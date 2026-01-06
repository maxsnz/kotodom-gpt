"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentLoader = void 0;
var adminjs_1 = require("adminjs");
exports.componentLoader = new adminjs_1.ComponentLoader();
var Components = {
    Dashboard: exports.componentLoader.add("Dashboard", "./Dashboard.tsx"),
    SendMessage: exports.componentLoader.add("SendMessage", "./SendMessage.tsx"),
    ShowMessages: exports.componentLoader.add("ShowMessages", "./ShowMessages.tsx"),
    ShowUserChats: exports.componentLoader.add("ShowUserChats", "./ShowUserChats.tsx"),
};
exports.default = Components;
