/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(5))`.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_shopifyStoreId_fkey`;

-- DropIndex
DROP INDEX `Order_orderNumber_key` ON `order`;

-- DropIndex
DROP INDEX `Order_shopifyStoreId_shopifyOrderId_key` ON `order`;

-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('DRAFT', 'UNPAID', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID';

-- AddForeignKey
ALTER TABLE `ProductOption` ADD CONSTRAINT `ProductOption_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
