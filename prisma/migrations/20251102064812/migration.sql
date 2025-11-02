/*
  Warnings:

  - You are about to drop the column `suggestedPrice` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `suggestedPrice`,
    ADD COLUMN `compareAtPrice` DOUBLE NULL,
    ADD COLUMN `price` DOUBLE NULL,
    ADD COLUMN `sellingPrice` DOUBLE NULL;
