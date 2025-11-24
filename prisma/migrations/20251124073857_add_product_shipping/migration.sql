-- CreateTable
CREATE TABLE `shipping_zone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_zone_country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shipping_zone_id` INTEGER NOT NULL,
    `countryCode` VARCHAR(191) NOT NULL,

    INDEX `shipping_zone_country_shipping_zone_id_idx`(`shipping_zone_id`),
    INDEX `shipping_zone_country_countryCode_idx`(`countryCode`),
    UNIQUE INDEX `shipping_zone_country_shipping_zone_id_countryCode_key`(`shipping_zone_id`, `countryCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_shipping_zone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `shipping_zone_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_shipping_zone_product_id_idx`(`product_id`),
    INDEX `product_shipping_zone_shipping_zone_id_idx`(`shipping_zone_id`),
    UNIQUE INDEX `product_shipping_zone_product_id_shipping_zone_id_key`(`product_id`, `shipping_zone_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_shipping_rule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_shipping_zone_id` INTEGER NOT NULL,
    `min_quantity` INTEGER NULL,
    `max_quantity` INTEGER NULL,
    `price_cents` INTEGER NOT NULL,

    INDEX `product_shipping_rule_product_shipping_zone_id_idx`(`product_shipping_zone_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shipping_zone_country` ADD CONSTRAINT `shipping_zone_country_shipping_zone_id_fkey` FOREIGN KEY (`shipping_zone_id`) REFERENCES `shipping_zone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_shipping_zone` ADD CONSTRAINT `product_shipping_zone_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_shipping_zone` ADD CONSTRAINT `product_shipping_zone_shipping_zone_id_fkey` FOREIGN KEY (`shipping_zone_id`) REFERENCES `shipping_zone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_shipping_rule` ADD CONSTRAINT `product_shipping_rule_product_shipping_zone_id_fkey` FOREIGN KEY (`product_shipping_zone_id`) REFERENCES `product_shipping_zone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
