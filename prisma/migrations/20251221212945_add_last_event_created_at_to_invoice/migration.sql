-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `last_event_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
