-- AlterTable
ALTER TABLE `media` ADD COLUMN `key` VARCHAR(191) NULL,
    ADD COLUMN `poster_key` VARCHAR(191) NULL,
    ADD COLUMN `preview` VARCHAR(191) NULL,
    ADD COLUMN `preview_key` VARCHAR(191) NULL;
