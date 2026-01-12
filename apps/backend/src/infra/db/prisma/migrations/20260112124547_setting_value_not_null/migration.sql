-- Update existing NULL values to empty string
UPDATE "Setting" SET "value" = '' WHERE "value" IS NULL;

-- AlterTable: Make value NOT NULL with default empty string
ALTER TABLE "Setting" ALTER COLUMN "value" SET NOT NULL;
ALTER TABLE "Setting" ALTER COLUMN "value" SET DEFAULT '';
