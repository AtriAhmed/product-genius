/*
  Warnings:

  - The values [PRICE_CHANGE] on the enum `notification_event` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `event` ENUM('OPTIONS_CHANGED', 'CARD_EXPIRED', 'SUBSCRIPTION_EXPIRED', 'SUBSCRIPTION_RENEWED', 'ORDER_CREATED', 'ORDER_ASSIGNED', 'ORDER_SHIPPED', 'ORDER_REFUNDED') NOT NULL;
