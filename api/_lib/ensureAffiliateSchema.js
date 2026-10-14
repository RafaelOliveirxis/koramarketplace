// Cria/atualiza o esquema da Área de Afiliados de forma idempotente.
// Executado pelo backend com as credenciais já configuradas; nunca expõe dados de conexão.
let schemaPromise;

async function ensureAffiliateSchema(db) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await db.query(`CREATE TABLE IF NOT EXISTS affiliate_profiles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        code VARCHAR(80) NOT NULL,
        commission_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
        pix_key VARCHAR(255) NULL,
        pix_key_type ENUM('CPF','CNPJ','EMAIL','PHONE','PIX_CODE') NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_affiliate_user (user_id),
        UNIQUE KEY uq_affiliate_code (code),
        CONSTRAINT fk_affiliate_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      await db.query(`CREATE TABLE IF NOT EXISTS affiliate_products (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(180) NOT NULL,
        category VARCHAR(120) NOT NULL,
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        status ENUM('Ativo','Em revisão','Inativo') NOT NULL DEFAULT 'Ativo',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ix_affiliate_products_user (user_id),
        CONSTRAINT fk_affiliate_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      await db.query(`CREATE TABLE IF NOT EXISTS affiliate_orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        external_id VARCHAR(100) NULL,
        customer_name VARCHAR(160) NULL,
        product_name VARCHAR(180) NULL,
        value DECIMAL(12,2) NOT NULL DEFAULT 0,
        status ENUM('Pago','Pendente','Cancelado') NOT NULL DEFAULT 'Pendente',
        ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ix_affiliate_orders_user_date (user_id, ordered_at),
        CONSTRAINT fk_affiliate_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      await db.query(`CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        code VARCHAR(80) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ix_affiliate_clicks_user_date (user_id, created_at),
        CONSTRAINT fk_affiliate_clicks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      await db.query(`CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        external_reference VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        pix_key VARCHAR(255) NOT NULL,
        pix_key_type ENUM('CPF','CNPJ','EMAIL','PHONE','PIX_CODE') NOT NULL,
        status ENUM('pending','processing','paid','failed','refunded') NOT NULL DEFAULT 'pending',
        provider_id VARCHAR(120) NULL,
        provider_status VARCHAR(80) NULL,
        provider_detail VARCHAR(255) NULL,
        idempotency_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_aff_withdraw_external (external_reference),
        UNIQUE KEY uq_aff_withdraw_idempotency (idempotency_key),
        KEY ix_aff_withdraw_user_status (user_id, status, created_at),
        CONSTRAINT fk_aff_withdraw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      // Consulta information_schema para compatibilidade com versões diferentes do MySQL.
      for (const [table, column, definition] of [
        ['affiliate_profiles', 'pix_key', 'VARCHAR(255) NULL'],
        ['affiliate_profiles', 'pix_key_type', "ENUM('CPF','CNPJ','EMAIL','PHONE','PIX_CODE') NULL"],
        ['fm_orders', 'affiliate_user_id', 'BIGINT UNSIGNED NULL'],
        ['fm_orders', 'affiliate_code', 'VARCHAR(80) NULL'],
        ['affiliate_withdrawals', 'provider_payout_id', 'VARCHAR(120) NULL'],
        ['affiliate_withdrawals', 'provider_transaction_id', 'VARCHAR(120) NULL']
      ]) {
        const [rows] = await db.execute(
          'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
          [table, column]
        );
        if (!rows.length) {
          const [tables] = await db.execute(
            'SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1',
            [table]
          );
          if (!tables.length) {
            throw new Error('A tabela obrigatória "' + table + '" não existe no banco atual. Execute primeiro o schema principal do FlashMarket.');
          }
          await db.query('ALTER TABLE `' + table + '` ADD COLUMN `' + column + '` ' + definition);
        }
      }
    })();
  }

  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

module.exports = { ensureAffiliateSchema };
