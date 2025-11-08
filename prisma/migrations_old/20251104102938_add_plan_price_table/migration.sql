/*
  Warnings:

  - You are about to drop the column `interval` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `oldPrice` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `plan` DROP COLUMN `interval`,
    DROP COLUMN `oldPrice`,
    DROP COLUMN `price`,
    DROP COLUMN `stripePriceId`;

-- CreateTable
CREATE TABLE `PlanPrice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planId` INTEGER NOT NULL,
    `interval` ENUM('DAY', 'WEEK', 'MONTH', 'YEAR') NOT NULL,
    `price` DOUBLE NULL,
    `compareAtPrice` DOUBLE NULL,
    `stripePriceId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlanPrice` ADD CONSTRAINT `PlanPrice_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
