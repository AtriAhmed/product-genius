-- AlterTable
ALTER TABLE `subscription` ADD COLUMN `interval` ENUM('DAY', 'WEEK', 'MONTH', 'YEAR') NULL;
