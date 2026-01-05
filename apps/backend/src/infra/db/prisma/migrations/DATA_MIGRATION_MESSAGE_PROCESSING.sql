-- Data migration script for MessageProcessing
-- This script should be run AFTER the Prisma migration that creates MessageProcessing table
-- Run this to migrate existing data from Message to MessageProcessing

-- Migrate user messages that have workflow state to MessageProcessing
INSERT INTO "MessageProcessing" (
  "userMessageId",
  "status",
  "attempts",
  "telegramUpdateId",
  "telegramIncomingMessageId",
  "telegramOutgoingMessageId",
  "responseMessageId",
  "responseGeneratedAt",
  "responseSentAt",
  "price",
  "createdAt",
  "updatedAt"
)
SELECT 
  m.id AS "userMessageId",
  CASE 
    WHEN m."responseSent" = true THEN 'COMPLETED'::"MessageProcessingStatus"
    WHEN m."responseGenerated" = true THEN 'PROCESSING'::"MessageProcessingStatus"
    ELSE 'RECEIVED'::"MessageProcessingStatus"
  END AS "status",
  0 AS "attempts",
  m."telegramUpdateId",
  NULL AS "telegramIncomingMessageId", -- We don't have this in old data
  m."telegramMessageId" AS "telegramOutgoingMessageId",
  (
    SELECT r.id 
    FROM "Message" r 
    WHERE r."userMessageId" = m.id 
    LIMIT 1
  ) AS "responseMessageId",
  CASE 
    WHEN m."responseGenerated" = true THEN m."createdAt"
    ELSE NULL
  END AS "responseGeneratedAt",
  CASE 
    WHEN m."responseSent" = true THEN m."createdAt"
    ELSE NULL
  END AS "responseSentAt",
  COALESCE((
    SELECT r.price 
    FROM "Message" r 
    WHERE r."userMessageId" = m.id 
    LIMIT 1
  ), 0) AS "price",
  m."createdAt",
  NOW() AS "updatedAt"
FROM "Message" m
WHERE m."tgUserId" IS NOT NULL -- Only user messages
  AND m.id NOT IN (SELECT "userMessageId" FROM "MessageProcessing" WHERE "userMessageId" IS NOT NULL)
ON CONFLICT ("userMessageId") DO NOTHING;

