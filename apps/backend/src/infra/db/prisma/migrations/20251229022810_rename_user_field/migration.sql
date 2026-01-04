-- RenameForeignKey
ALTER TABLE "Chat" RENAME CONSTRAINT "Chat_userId_fkey" TO "Chat_tgUserId_fkey";

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_userId_fkey" TO "Message_tgUserId_fkey";
