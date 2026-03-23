-- Full seed: schema + products + admin (password '123456')
CREATE DATABASE IF NOT EXISTS `FashionStore_DB` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `FashionStore_DB`;

-- Categories
CREATE TABLE IF NOT EXISTS `Categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL,
  `category_code` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products
CREATE TABLE IF NOT EXISTS `Products` (
  `product_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` INT NOT NULL DEFAULT 0,
  `img` VARCHAR(255) DEFAULT NULL,
  `back` VARCHAR(255) DEFAULT NULL,
  `badge` VARCHAR(50) DEFAULT NULL,
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product sizes
CREATE TABLE IF NOT EXISTS `Product_Sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `size_name` VARCHAR(50) NOT NULL,
  CONSTRAINT `fk_sizes_product` FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users
CREATE TABLE IF NOT EXISTS `Users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert categories
INSERT INTO `Categories` (`category_name`, `category_code`)
VALUES
  ('Quần Nam', 'quan-au'),
  ('Áo Nam', 'ao-nam'),
  ('Phụ Kiện', 'phu-kien')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- Insert products
INSERT INTO `Products` (`category_id`, `name`, `price`, `img`, `back`, `badge`, `description`)
VALUES
  ((SELECT category_id FROM Categories WHERE category_code='ao-nam'), 'Áo Polo Basic', 450000, 'Asset/img/product/ao-polo-1.jpg', 'Asset/img/product/ao-polo-1-back.jpg', NULL, 'Áo polo basic'),
  ((SELECT category_id FROM Categories WHERE category_code='ao-nam'), 'Sơ Mi Oversize', 520000, 'Asset/img/product/ao-somi-1.jpg', 'Asset/img/product/ao-somi-1-back.jpg', 'HOT', 'Sơ mi oversize'),
  ((SELECT category_id FROM Categories WHERE category_code='ao-nam'), 'Áo Thun Graphic 1', 350000, 'Asset/img/product/ao-thun-1.jpg', 'Asset/img/product/ao-thun-1-back.jpg', 'NEW', 'Áo thun graphic 1'),
  ((SELECT category_id FROM Categories WHERE category_code='ao-nam'), 'Áo Thun Graphic 2', 380000, 'Asset/img/product/ao-thun-2.jpg', 'Asset/img/product/ao-thun-2-back.jpg', NULL, 'Áo thun graphic 2'),
  ((SELECT category_id FROM Categories WHERE category_code='phu-kien'), 'Giày Sneaker', 890000, 'Asset/img/product/giay-1.jpg', 'Asset/img/product/giay-1-back.jpg', 'HOT', 'Giày sneaker'),
  ((SELECT category_id FROM Categories WHERE category_code='phu-kien'), 'Mũ Lưỡi Trai', 220000, 'Asset/img/product/mu-1.jpg', 'Asset/img/product/mu-1-back.jpg', NULL, 'Mũ lưỡi trai'),
  ((SELECT category_id FROM Categories WHERE category_code='quan-au'), 'Quần Âu Aristino', 850000, 'Asset/img/product/quan-au-1.jpg', 'Asset/img/product/quan-au-1-back.jpg', 'NEW', 'Quần âu aristino'),
  ((SELECT category_id FROM Categories WHERE category_code='quan-au'), 'Quần Âu Premium', 950000, 'Asset/img/product/quan-au-2.jpg', 'Asset/img/product/quan-au-2-back.jpg', '-20%', 'Quần âu premium'),
  ((SELECT category_id FROM Categories WHERE category_code='quan-au'), 'Quần Âu Classic', 750000, 'Asset/img/product/quan-au-3.jpg', 'Asset/img/product/quan-au-3-back.jpg', 'SOLD OUT', 'Quần âu classic'),
  ((SELECT category_id FROM Categories WHERE category_code='quan-au'), 'Quần Âu Limited', 1200000, 'Asset/img/product/quan-au-4.jpg', 'Asset/img/product/quan-au-4-back.jpg', 'HOT', 'Quần âu limited'),
  ((SELECT category_id FROM Categories WHERE category_code='phu-kien'), 'Thắt Lưng Da Cao Cấp', 280000, 'Asset/img/product/that-lung-1.jpg', 'Asset/img/product/that-lung-1-back.jpg', NULL, 'Thắt lưng da cao cấp'),
  ((SELECT category_id FROM Categories WHERE category_code='phu-kien'), 'Ví Chia Khoá', 180000, 'Asset/img/product/vi-1.jpg', 'Asset/img/product/vi-1-back.jpg', 'NEW', 'Ví chia khóa');

-- Sample sizes
INSERT INTO `Product_Sizes` (`product_id`, `size_name`)
VALUES
  ((SELECT product_id FROM Products WHERE name='Quần Âu Aristino'), 'S'),
  ((SELECT product_id FROM Products WHERE name='Quần Âu Aristino'), 'M'),
  ((SELECT product_id FROM Products WHERE name='Quần Âu Aristino'), 'L'),
  ((SELECT product_id FROM Products WHERE name='Quần Âu Premium'), 'S'),
  ((SELECT product_id FROM Products WHERE name='Quần Âu Premium'), 'M'),
  ((SELECT product_id FROM Products WHERE name='Áo Thun Graphic 1'), 'XS'),
  ((SELECT product_id FROM Products WHERE name='Áo Thun Graphic 1'), 'S'),
  ((SELECT product_id FROM Products WHERE name='Áo Thun Graphic 2'), 'S'),
  ((SELECT product_id FROM Products WHERE name='Thắt Lưng Da Cao Cấp'), 'Free');

-- Admin account (password stored as plaintext '123456' for now)
INSERT INTO `Users` (`email`, `password_hash`, `first_name`, `last_name`, `phone`)
VALUES ('admin@example.com', '123456', 'Admin', 'User', '+84000000000')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), first_name = VALUES(first_name), last_name = VALUES(last_name), phone = VALUES(phone);

-- End of full_seed.sql
