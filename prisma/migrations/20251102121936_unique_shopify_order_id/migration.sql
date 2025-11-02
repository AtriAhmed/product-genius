/*
  Warnings:

  - A unique constraint covering the columns `[shopifyOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyStoreId,shopifyOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Order_shopifyOrderId_key` ON `Order`(`shopifyOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_shopifyStoreId_shopifyOrderId_key` ON `Order`(`shopifyStoreId`, `shopifyOrderId`);
