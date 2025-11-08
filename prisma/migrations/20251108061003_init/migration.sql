-- CreateTable
CREATE TABLE `temp_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `temp_account_email_key`(`email`),
    UNIQUE INDEX `temp_account_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NULL,
    `role` ENUM('OWNER', 'ADMIN', 'EDITOR', 'AGENT', 'USER') NOT NULL DEFAULT 'USER',
    `stripe_customer_id` VARCHAR(191) NULL,
    `reset_token` VARCHAR(191) NULL,
    `reset_token_expires` DATETIME(3) NULL,
    `current_subscription_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `stripe_product_id` VARCHAR(191) NULL,
    `features` JSON NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `most_popular` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_price` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_id` INTEGER NOT NULL,
    `interval` ENUM('DAY', 'WEEK', 'MONTH', 'YEAR') NOT NULL,
    `price` DOUBLE NULL,
    `compare_at_price` DOUBLE NULL,
    `stripe_price_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_id` INTEGER NOT NULL,
    `interval` ENUM('DAY', 'WEEK', 'MONTH', 'YEAR') NULL,
    `stripe_subscription_id` VARCHAR(191) NULL,
    `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'UNPAID') NOT NULL DEFAULT 'TRIALING',
    `starts_at` DATETIME(3) NULL,
    `ends_at` DATETIME(3) NULL,
    `trial_ends_at` DATETIME(3) NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
    `usage` JSON NULL,
    `latest_stripe_invoice_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stripe_invoice_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `stripe_subscription_id` VARCHAR(191) NULL,
    `amount_cents` INTEGER NOT NULL,
    `tax_cents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `pdf_url` VARCHAR(191) NULL,
    `hosted_url` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `type` ENUM('PLAN', 'ORDER') NULL,
    `period_start` DATETIME(3) NOT NULL,
    `period_end` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invoice_stripe_invoice_id_key`(`stripe_invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_translation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `category_translation_category_id_locale_key`(`category_id`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `compare_at_price` DOUBLE NULL,
    `selling_price` DOUBLE NULL,
    `currency` VARCHAR(191) NULL,
    `popularity_score` INTEGER NOT NULL DEFAULT 0,
    `shopify_id` VARCHAR(191) NULL,
    `shopify_imported` BOOLEAN NOT NULL DEFAULT false,
    `category_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `views` INTEGER NOT NULL DEFAULT 0,
    `likes` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_option_product_id_position_key`(`product_id`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_option_value` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `option_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_option_value_option_id_idx`(`option_id`),
    UNIQUE INDEX `product_option_value_option_id_value_key`(`option_id`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `compare_at_price` DOUBLE NULL,
    `selling_price` DOUBLE NULL,
    `sku` VARCHAR(191) NULL,
    `inventory` INTEGER NOT NULL DEFAULT 0,
    `track_inventory` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_variant_product_id_idx`(`product_id`),
    INDEX `product_variant_sku_idx`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variant_option_value` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_variant_id` INTEGER NOT NULL,
    `option_id` INTEGER NOT NULL,
    `value_id` INTEGER NOT NULL,

    UNIQUE INDEX `product_variant_option_value_product_variant_id_option_id_key`(`product_variant_id`, `option_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variant_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `variant_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `shopify_variant_id` VARCHAR(191) NOT NULL,
    `shopify_product_id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `variant_mapping_variant_id_idx`(`variant_id`),
    INDEX `variant_mapping_product_id_idx`(`product_id`),
    INDEX `variant_mapping_shop_idx`(`shop`),
    UNIQUE INDEX `variant_mapping_shopify_variant_id_shop_key`(`shopify_variant_id`, `shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `shopify_product_id` VARCHAR(191) NOT NULL,
    `shopify_store_id` INTEGER NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `product_mapping_product_id_shop_key`(`product_id`, `shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_translation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,

    UNIQUE INDEX `product_translation_product_id_locale_key`(`product_id`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NULL,
    `url` VARCHAR(191) NOT NULL,
    `poster` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NULL,
    `type` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NULL,
    `marketplace` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `currency` VARCHAR(191) NULL,
    `is_internal` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,

    INDEX `supplier_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(191) NOT NULL,
    `shopify_order_id` VARCHAR(191) NULL,
    `shopify_store_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `agent_id` INTEGER NULL,
    `invoice_id` INTEGER NULL,
    `total_cents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'UNPAID', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `delivery_name` VARCHAR(191) NULL,
    `delivery_phone` VARCHAR(191) NULL,
    `delivery_email` VARCHAR(191) NULL,
    `delivery_address1` VARCHAR(191) NULL,
    `delivery_address2` VARCHAR(191) NULL,
    `delivery_city` VARCHAR(191) NULL,
    `delivery_state` VARCHAR(191) NULL,
    `delivery_zip` VARCHAR(191) NULL,
    `delivery_country` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `order_shopify_order_id_key`(`shopify_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `unit_price_cents` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `product_variant_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agent_profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `company_name` VARCHAR(191) NULL,
    `contact_number` VARCHAR(191) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agent_profile_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shopify_store_shop_key`(`shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_plan_products` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_plan_products_AB_unique`(`A`, `B`),
    INDEX `_plan_products_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_current_subscription_id_fkey` FOREIGN KEY (`current_subscription_id`) REFERENCES `subscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_price` ADD CONSTRAINT `plan_price_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_translation` ADD CONSTRAINT `category_translation_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_option` ADD CONSTRAINT `product_option_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_option_value` ADD CONSTRAINT `product_option_value_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `product_option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant` ADD CONSTRAINT `product_variant_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_option_value` ADD CONSTRAINT `product_variant_option_value_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_option_value` ADD CONSTRAINT `product_variant_option_value_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `product_option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_option_value` ADD CONSTRAINT `product_variant_option_value_value_id_fkey` FOREIGN KEY (`value_id`) REFERENCES `product_option_value`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variant_mapping` ADD CONSTRAINT `variant_mapping_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variant_mapping` ADD CONSTRAINT `variant_mapping_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variant_mapping` ADD CONSTRAINT `variant_mapping_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_mapping` ADD CONSTRAINT `product_mapping_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_mapping` ADD CONSTRAINT `product_mapping_shopify_store_id_fkey` FOREIGN KEY (`shopify_store_id`) REFERENCES `shopify_store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_mapping` ADD CONSTRAINT `product_mapping_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_translation` ADD CONSTRAINT `product_translation_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_shopify_store_id_fkey` FOREIGN KEY (`shopify_store_id`) REFERENCES `shopify_store`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_profile` ADD CONSTRAINT `agent_profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopify_store` ADD CONSTRAINT `shopify_store_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_plan_products` ADD CONSTRAINT `_plan_products_A_fkey` FOREIGN KEY (`A`) REFERENCES `plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_plan_products` ADD CONSTRAINT `_plan_products_B_fkey` FOREIGN KEY (`B`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
