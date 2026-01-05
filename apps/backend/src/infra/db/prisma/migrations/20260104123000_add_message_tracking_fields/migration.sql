-- Add tracking fields for incoming/outgoing Telegram messages
ALTER TABLE "Message"
  ADD COLUMN "telegramUpdateId" BIGINT,
  ADD COLUMN "responseGenerated" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "responseSent" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "telegramMessageId" INTEGER,
  ADD COLUMN "userMessageId" INTEGER;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_userMessageId_fkey"
  FOREIGN KEY ("userMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

