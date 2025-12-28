import { DatabaseService } from "./services/database.service";

const databaseService = new DatabaseService();
await databaseService.connect();

export default databaseService.getClient();
