-- DropForeignKey
ALTER TABLE `product_mapping` DROP FOREIGN KEY `product_mapping_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_mapping` DROP FOREIGN KEY `product_mapping_shopify_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_mapping` DROP FOREIGN KEY `product_mapping_user_id_fkey`;

-- DropIndex
DROP INDEX `product_mapping_shopify_store_id_fkey` ON `product_mapping`;

-- DropIndex
DROP INDEX `product_mapping_user_id_fkey` ON `product_mapping`;

-- AddForeignKey
ALTER TABLE `product_mapping` ADD CONSTRAINT `product_mapping_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_mapping` ADD CONSTRAINT `product_mapping_shopify_store_id_fkey` FOREIGN KEY (`shopify_store_id`) REFERENCES `shopify_store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_mapping` ADD CONSTRAINT `product_mapping_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
