/*
  Warnings:

  - You are about to alter the column `interval` on the `plan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `plan` ADD COLUMN `mostPopular` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0,
    MODIFY `interval` ENUM('DAY', 'WEEK', 'MONTH', 'YEAR') NOT NULL;
