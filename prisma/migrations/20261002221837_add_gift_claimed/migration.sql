-- DropIndex
DROP INDEX "User_telegramLinkCode_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "giftClaimed" BOOLEAN NOT NULL DEFAULT false;
