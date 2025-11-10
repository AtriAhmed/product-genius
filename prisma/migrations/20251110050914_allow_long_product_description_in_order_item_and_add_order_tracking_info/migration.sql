-- AlterTable
ALTER TABLE `order` ADD COLUMN `tracking_number` VARCHAR(191) NULL,
    ADD COLUMN `tracking_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order_item` MODIFY `product_description` TEXT NULL;
