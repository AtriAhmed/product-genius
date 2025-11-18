-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `media_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier` DROP FOREIGN KEY `supplier_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `variant_mapping` DROP FOREIGN KEY `variant_mapping_user_id_fkey`;

-- DropIndex
DROP INDEX `media_product_id_fkey` ON `media`;

-- DropIndex
DROP INDEX `variant_mapping_user_id_fkey` ON `variant_mapping`;

-- AddForeignKey
ALTER TABLE `variant_mapping` ADD CONSTRAINT `variant_mapping_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
