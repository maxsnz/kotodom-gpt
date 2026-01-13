-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "prompt" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "model" SET DEFAULT 'gpt-5-nano';
