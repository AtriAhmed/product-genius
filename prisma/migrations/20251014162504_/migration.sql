/*
  Warnings:

  - You are about to drop the column `stripePriceId` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `plan` DROP COLUMN `stripePriceId`,
    ADD COLUMN `stripeProductId` VARCHAR(191) NULL;
