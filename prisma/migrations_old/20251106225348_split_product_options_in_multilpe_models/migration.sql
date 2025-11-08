/*
  Warnings:

  - You are about to drop the column `values` on the `productoption` table. All the data in the column will be lost.
  - You are about to drop the column `option1` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `option2` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `option3` on the `productvariant` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `productvariant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `compareAtPrice` on the `productvariant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `costPrice` on the `productvariant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `productoption` DROP COLUMN `values`;

-- AlterTable
ALTER TABLE `productvariant` DROP COLUMN `option1`,
    DROP COLUMN `option2`,
    DROP COLUMN `option3`,
    MODIFY `price` DOUBLE NOT NULL,
    MODIFY `compareAtPrice` DOUBLE NULL,
    MODIFY `costPrice` DOUBLE NULL;

-- CreateTable
CREATE TABLE `ProductOptionValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `optionId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductOptionValue_optionId_idx`(`optionId`),
    UNIQUE INDEX `ProductOptionValue_optionId_value_key`(`optionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantOptionValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productVariantId` INTEGER NOT NULL,
    `optionId` INTEGER NOT NULL,
    `valueId` INTEGER NOT NULL,

    UNIQUE INDEX `ProductVariantOptionValue_productVariantId_optionId_key`(`productVariantId`, `optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductOptionValue` ADD CONSTRAINT `ProductOptionValue_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `ProductOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOptionValue` ADD CONSTRAINT `ProductVariantOptionValue_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOptionValue` ADD CONSTRAINT `ProductVariantOptionValue_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `ProductOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOptionValue` ADD CONSTRAINT `ProductVariantOptionValue_valueId_fkey` FOREIGN KEY (`valueId`) REFERENCES `ProductOptionValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
