/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` ADD COLUMN `key` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Category_key_key` ON `Category`(`key`);
