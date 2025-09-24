/*
  Warnings:

  - You are about to drop the column `key` on the `category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Category_key_key` ON `category`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `key`;
