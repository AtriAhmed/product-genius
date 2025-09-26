/*
  Warnings:

  - You are about to drop the column `slug` on the `producttranslation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `categorytranslation` DROP FOREIGN KEY `CategoryTranslation_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `producttranslation` DROP FOREIGN KEY `ProductTranslation_productId_fkey`;

-- AlterTable
ALTER TABLE `producttranslation` DROP COLUMN `slug`;

-- AddForeignKey
ALTER TABLE `CategoryTranslation` ADD CONSTRAINT `CategoryTranslation_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductTranslation` ADD CONSTRAINT `ProductTranslation_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
