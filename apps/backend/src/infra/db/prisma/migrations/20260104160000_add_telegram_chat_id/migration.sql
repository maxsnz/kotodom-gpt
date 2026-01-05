-- Add telegramChatId column to Chat table
ALTER TABLE "Chat" ADD COLUMN "telegramChatId" BIGINT;

-- Backfill: extract telegramChatId from id by removing botId suffix
-- id format is "{telegramChatId}{botId}", so we remove the last N characters where N = length of botId
UPDATE "Chat" 
SET "telegramChatId" = CAST(
  SUBSTR("id", 1, LENGTH("id") - LENGTH(CAST("botId" AS TEXT))) 
  AS BIGINT
)
WHERE "botId" IS NOT NULL;

-- For chats without botId, use tgUserId as telegramChatId (private chats)
UPDATE "Chat"
SET "telegramChatId" = "tgUserId"
WHERE "botId" IS NULL AND "telegramChatId" IS NULL;

-- Make column NOT NULL after backfill
ALTER TABLE "Chat" ALTER COLUMN "telegramChatId" SET NOT NULL;

