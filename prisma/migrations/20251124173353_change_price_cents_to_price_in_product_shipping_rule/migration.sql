/*
  Warnings:

  - You are about to drop the column `price_cents` on the `product_shipping_rule` table. All the data in the column will be lost.
  - Added the required column `price` to the `product_shipping_rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_shipping_rule` DROP COLUMN `price_cents`,
    ADD COLUMN `price` INTEGER NOT NULL;
