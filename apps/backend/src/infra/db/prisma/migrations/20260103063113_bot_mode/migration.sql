-- CreateEnum
CREATE TYPE "TelegramModeEnum" AS ENUM ('polling', 'webhook');

-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "telegramMode" "TelegramModeEnum" NOT NULL DEFAULT 'webhook';
