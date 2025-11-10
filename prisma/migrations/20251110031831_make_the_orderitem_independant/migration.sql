/*
  Warnings:

  - You are about to drop the column `product_variant_id` on the `order_item` table. All the data in the column will be lost.
  - Added the required column `product_title` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order_item` DROP FOREIGN KEY `order_item_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_item` DROP FOREIGN KEY `order_item_product_variant_id_fkey`;

-- DropIndex
DROP INDEX `order_item_product_id_fkey` ON `order_item`;

-- DropIndex
DROP INDEX `order_item_product_variant_id_fkey` ON `order_item`;

-- AlterTable
ALTER TABLE `order_item` DROP COLUMN `product_variant_id`,
    ADD COLUMN `image_alt` VARCHAR(191) NULL,
    ADD COLUMN `image_url` VARCHAR(191) NULL,
    ADD COLUMN `product_description` VARCHAR(191) NULL,
    ADD COLUMN `product_sku` VARCHAR(191) NULL,
    ADD COLUMN `product_title` VARCHAR(191) NOT NULL,
    ADD COLUMN `variant_id` INTEGER NULL,
    ADD COLUMN `variant_options` JSON NULL,
    MODIFY `product_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
