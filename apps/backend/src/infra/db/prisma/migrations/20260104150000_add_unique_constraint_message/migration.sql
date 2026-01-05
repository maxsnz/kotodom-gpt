-- Add unique constraint on (botId, telegramUpdateId) to prevent duplicate message processing
-- NULL values are considered distinct in PostgreSQL, so this only applies to user messages
CREATE UNIQUE INDEX "Message_botId_telegramUpdateId_key" ON "Message"("botId", "telegramUpdateId");

