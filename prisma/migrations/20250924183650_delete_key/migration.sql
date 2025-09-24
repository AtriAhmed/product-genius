/*
  Warnings:

  - You are about to drop the column `key` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDescription` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `defaultTitle` on the `product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Category_key_key` ON `category`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `key`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `defaultDescription`,
    DROP COLUMN `defaultTitle`;
