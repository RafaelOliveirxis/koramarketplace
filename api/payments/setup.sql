-- Estrutura exclusiva do checkout/pagamentos do FlashMarket.
-- Execute depois de criar o banco configurado em DB_NAME.

CREATE TABLE IF NOT EXISTS fm_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(30) NULL,
  cep VARCHAR(10) NOT NULL,
  state VARCHAR(2) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(220) NOT NULL,
  complement VARCHAR(120) NULL,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(30) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'created',
  status_detail VARCHAR(80) NULL,
  mp_order_id VARCHAR(80) NULL,
  mp_checkout_url TEXT NULL,
  mp_external_reference VARCHAR(64) NOT NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fm_orders_public_id (public_id),
  UNIQUE KEY uq_fm_orders_external_reference (mp_external_reference),
  UNIQUE KEY uq_fm_orders_mp_order_id (mp_order_id),
  KEY ix_fm_orders_email (customer_email),
  KEY ix_fm_orders_status (status),
  KEY ix_fm_orders_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fm_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_fm_order_items_order (order_id),
  CONSTRAINT fk_fm_order_items_order FOREIGN KEY (order_id) REFERENCES fm_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
