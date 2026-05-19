
CREATE DATABASE IF NOT EXISTS kev_inv_web;
USE kev_inv_web;

-- INVENTORY
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  sku_prefix VARCHAR(10) NOT NULL UNIQUE
);

INSERT INTO categories (name, sku_prefix) VALUES
('other', 'OTHE'),
('aice', 'AICE');

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(25) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  retail_price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_retail_price CHECK (retail_price >= 0),
  CONSTRAINT chk_stock CHECK (stock >= 0),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- POS
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(20) NOT NULL UNIQUE,
  total_amount DECIMAL(12,2) NOT NULL,
  cash_tendered DECIMAL(12,2) DEFAULT 0,
  change_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_total CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  sku VARCHAR(25) NOT NULL,
  name VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

-- RETURN
CREATE TABLE returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  receipt_no VARCHAR(50) UNIQUE,
  total_refund DECIMAL(10,2) DEFAULT 0,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

CREATE TABLE return_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  return_id INT,
  sale_item_id INT,
  product_id INT,
  sku VARCHAR(50),
  quantity INT,
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  FOREIGN KEY (return_id) REFERENCES returns(id)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE cash_outs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  category ENUM('puhunan','bills','sahod','supplies','withdrawal','other') NOT NULL,
  description VARCHAR(255),
  sku VARCHAR(25) NULL,
  quantity INT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_amount CHECK (amount > 0),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (sku) REFERENCES products(sku)
) ENGINE=InnoDB;