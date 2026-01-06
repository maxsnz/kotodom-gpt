"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_service_1 = require("./services/database.service");
var databaseService = new database_service_1.DatabaseService();
await databaseService.connect();
exports.default = databaseService.getClient();
