/*
  Warnings:

  - You are about to drop the column `costPrice` on the `productvariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `productvariant` DROP COLUMN `costPrice`,
    ADD COLUMN `sellingPrice` DOUBLE NULL;
