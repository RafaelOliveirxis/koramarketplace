const products = [
[1,'Luminária LED de Mesa',89.90],[2,'Organizador Multiuso Minimalista',39.90],[3,'Moletom Street Flash',119.90],[4,'Caderno Criativo Premium',34.90],[5,'Fone Bluetooth Pocket',149.90],[6,'Camiseta Básica Oversized',59.90],[7,'Mouse Sem Fio Slim',64.90],[8,'Vaso Decorativo Geométrico',44.90],[9,'Smartwatch Fit Pro',199.90],[10,'Caixa de Som Bluetooth',129.90],[11,'Teclado Mecânico RGB',229.90],[12,'Suporte para Notebook',79.90],[13,'Carregador Turbo USB-C',69.90],[14,'Cabo USB-C Reforçado',29.90],[15,'Ring Light LED 26cm',89.90],[16,'Mochila Executiva Casual',109.90],[17,'Tênis Casual Urban',179.90],[18,'Jaqueta Corta-Vento',159.90],[19,'Calça Jogger Comfort',99.90],[20,'Boné Streetwear',49.90],[21,'Bolsa Transversal Compacta',69.90],[22,'Kit 3 Camisetas Básicas',119.90],[23,'Garrafa Térmica Inox 500ml',59.90],[24,'Kit Organizadores de Gaveta',49.90],[25,'Almofada Decorativa Premium',54.90],[26,'Relógio de Parede Minimalista',74.90],[27,'Tapete Decorativo Soft',129.90],[28,'Kit Potes Herméticos 5 peças',69.90],[29,'Garrafa para Pet',34.90],[30,'Cama Confort Pet',99.90],[31,'Brinquedo Interativo para Pet',39.90],[32,'Tapete Higiênico Lavável',44.90],[33,'Planner Semanal Premium',39.90],[34,'Kit Canetas Coloridas 12 cores',24.90],[35,'Estojo Escolar Multiuso',29.90],[36,'Caderno Pontilhado A5',32.90],[37,'Kit Higiene e Beleza Viagem',59.90],[38,'Espelho LED de Mesa',99.90],[39,'Necessaire Organizadora',44.90],[40,'Kit Pincéis para Maquiagem',49.90],[41,'Tapete de Yoga Antiderrapante',79.90],[42,'Corda de Pular Profissional',34.90],[43,'Garrafa Esportiva 750ml',44.90],[44,'Kit Faixas Elásticas Fitness',54.90],[45,'Bola de Futebol Campo',89.90],[46,'SmartGrip Pro',79.90],[47,'Hub USB 4 Portas',54.90],[48,'Luminária RGB Ambiente',69.90],[49,'Copo Térmico com Tampa',49.90],[50,'Kit Escritório Organizado',64.90]
];

let ready;
async function ensurePaymentsSchema(db) {
  if (!ready) {
    ready = (async () => {
      await db.execute(`CREATE TABLE IF NOT EXISTS fm_catalog (
        product_id INT NOT NULL, name VARCHAR(200) NOT NULL, price DECIMAL(10,2) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1, PRIMARY KEY (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      await db.execute(`CREATE TABLE IF NOT EXISTS fm_favorites (
        user_id BIGINT UNSIGNED NOT NULL, product_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, product_id), KEY ix_fm_favorites_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      await db.execute(`CREATE TABLE IF NOT EXISTS fm_orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, public_id VARCHAR(32) NOT NULL,
        user_id BIGINT UNSIGNED NULL, customer_name VARCHAR(120) NOT NULL, customer_email VARCHAR(190) NOT NULL,
        customer_phone VARCHAR(30) NULL, cep VARCHAR(10) NOT NULL, state VARCHAR(2) NOT NULL, city VARCHAR(100) NOT NULL,
        address VARCHAR(220) NOT NULL, complement VARCHAR(120) NULL, shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(30) NOT NULL, total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(40) NOT NULL DEFAULT 'created',
        status_detail VARCHAR(80) NULL, mp_order_id VARCHAR(80) NULL, mp_checkout_url TEXT NULL,
        mp_external_reference VARCHAR(64) NOT NULL, paid_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id), UNIQUE KEY uq_fm_orders_public_id (public_id),
        UNIQUE KEY uq_fm_orders_external_reference (mp_external_reference), UNIQUE KEY uq_fm_orders_mp_order_id (mp_order_id),
        KEY ix_fm_orders_email (customer_email), KEY ix_fm_orders_status (status), KEY ix_fm_orders_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      await db.execute(`CREATE TABLE IF NOT EXISTS fm_order_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL, product_id INT NOT NULL,
        product_name VARCHAR(200) NOT NULL, unit_price DECIMAL(10,2) NOT NULL, quantity INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY ix_fm_order_items_order (order_id),
        CONSTRAINT fk_fm_order_items_order FOREIGN KEY (order_id) REFERENCES fm_orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      await db.execute(`CREATE TABLE IF NOT EXISTS fm_order_tracking (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL,
        status VARCHAR(40) NOT NULL, title VARCHAR(120) NOT NULL, description VARCHAR(500) NULL,
        tracking_code VARCHAR(80) NULL, carrier VARCHAR(120) NULL, event_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY ix_fm_tracking_order (order_id), KEY ix_fm_tracking_event (event_at),
        CONSTRAINT fk_fm_tracking_order FOREIGN KEY (order_id) REFERENCES fm_orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const values=[]; for (const p of products) values.push(...p,1);
      const placeholders=products.map(()=>'(?,?,?,?)').join(',');
      await db.execute(`INSERT INTO fm_catalog (product_id,name,price,active) VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE name=VALUES(name),price=VALUES(price),active=1`, values);
    })().catch(error => { ready = null; throw error; });
  }
  return ready;
}
module.exports = { ensurePaymentsSchema };