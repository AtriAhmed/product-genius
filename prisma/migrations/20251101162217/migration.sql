/*
  Warnings:

  - Added the required column `userId` to the `ProductMapping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `VariantMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productmapping` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `variantmapping` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `VariantMapping` ADD CONSTRAINT `VariantMapping_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductMapping` ADD CONSTRAINT `ProductMapping_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
