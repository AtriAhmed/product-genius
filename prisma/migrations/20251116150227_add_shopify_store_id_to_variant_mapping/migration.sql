-- AlterTable
ALTER TABLE `variant_mapping` ADD COLUMN `shopify_store_id` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `variant_mapping` ADD CONSTRAINT `variant_mapping_shopify_store_id_fkey` FOREIGN KEY (`shopify_store_id`) REFERENCES `shopify_store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
