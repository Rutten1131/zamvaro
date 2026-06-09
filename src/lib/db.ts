import mysql from 'mysql2/promise';
import { products as initialProducts } from '@/data/products';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 40940,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default pool;

export async function initDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log(' Conectado exitosamente a la base de datos MySQL.');

    // Crear tabla de productos si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        hookText TEXT,
        category VARCHAR(100),
        price VARCHAR(50),
        originalPrice VARCHAR(50),
        tag VARCHAR(100),
        emoji VARCHAR(10),
        image TEXT,
        images JSON,
        imageProblem TEXT,
        imageFeatures TEXT,
        imageHowTo TEXT,
        isAvailable BOOLEAN DEFAULT TRUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        bullets JSON,
        features JSON,
        testimonials JSON,
        comparisonTitle VARCHAR(255),
        comparisonOursLabel VARCHAR(255),
        comparisonTheirsLabel VARCHAR(255),
        comparison JSON,
        stats JSON,
        steps JSON,
        faqs JSON,
        guaranteeText TEXT,
        whatsappNumber VARCHAR(50),
        primaryColor VARCHAR(20) DEFAULT NULL,
        problemFactors JSON,
        problemTagline VARCHAR(255),
        problemHeadline VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Crear tabla de imágenes guardadas en MySQL como BLOB
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        data LONGBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Crear tabla de suscriptores al newsletter si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Crear tabla de clics a WhatsApp para rastreo invisible por producto
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wa_clicks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_slug VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        section VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);


    // Agregar columna primaryColor si no existe (migración segura)
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN primaryColor VARCHAR(20) DEFAULT NULL`);
      console.log('Columna primaryColor agregada a products.');
    } catch (e: any) {
      if (!e.message?.includes('Duplicate column')) {
        // Ignorar error si la columna ya existe
      }
    }

    // Agregar columnas de problemFactors si no existen (migración segura)
    const newColumns = [
      { name: 'problemFactors', def: 'JSON' },
      { name: 'problemTagline', def: 'VARCHAR(255)' },
      { name: 'problemHeadline', def: 'VARCHAR(255)' },
    ];
    for (const col of newColumns) {
      try {
        await connection.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.def}`);
        console.log(`Columna ${col.name} agregada a products.`);
      } catch (e: any) {
        // Ignorar si ya existe
      }
    }

    // Verificar si ya hay productos
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    const count = (rows as any)[0]?.count || 0;

    if (count === 0) {
      console.log('La tabla products está vacía. Insertando producto inicial...');
      const defaultProduct = initialProducts.find(p => p.id === 1);

      if (defaultProduct) {
        await connection.query(
          `INSERT INTO products (
            name, subtitle, hookText, category, price, originalPrice, tag, emoji, image, images,
            imageProblem, imageFeatures, imageHowTo,
            isAvailable, slug, bullets, features, testimonials, comparisonTitle, comparisonOursLabel,
            comparisonTheirsLabel, comparison, stats, steps, faqs, guaranteeText, whatsappNumber
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            defaultProduct.name,
            defaultProduct.subtitle || null,
            defaultProduct.hookText || null,
            defaultProduct.category || null,
            defaultProduct.price,
            defaultProduct.originalPrice || null,
            defaultProduct.tag || null,
            defaultProduct.emoji || null,
            defaultProduct.image || null,
            JSON.stringify(defaultProduct.images || []),
            defaultProduct.imageProblem || null,
            defaultProduct.imageFeatures || null,
            defaultProduct.imageHowTo || null,
            defaultProduct.isAvailable ? 1 : 0,
            defaultProduct.slug || 'cepillo-secador-3-en-1',
            JSON.stringify(defaultProduct.bullets || []),
            JSON.stringify(defaultProduct.features || []),
            JSON.stringify(defaultProduct.testimonials || []),
            defaultProduct.comparisonTitle || null,
            defaultProduct.comparisonOursLabel || null,
            defaultProduct.comparisonTheirsLabel || null,
            JSON.stringify(defaultProduct.comparison || []),
            JSON.stringify(defaultProduct.stats || []),
            JSON.stringify(defaultProduct.steps || []),
            JSON.stringify(defaultProduct.faqs || []),
            defaultProduct.guaranteeText || null,
            defaultProduct.whatsappNumber || null,
          ]
        );
        console.log('Producto inicial insertado con éxito.');
      }
    }
    // =============================================
    // TABLAS DEL CHATBOT DE WHATSAPP
    // =============================================

    // Mapeo anuncio → producto (clave para identificar el producto desde el anuncio)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ad_product_mapping (
        ad_source_id   VARCHAR(100) PRIMARY KEY,
        product_id     INT NOT NULL,
        ad_name        VARCHAR(255),
        campaign_name  VARCHAR(255),
        adset_name     VARCHAR(255),
        match_score    FLOAT DEFAULT 0,
        is_confirmed   BOOLEAN DEFAULT FALSE,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Sesiones activas del chatbot (estado de cada conversación)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        phone            VARCHAR(20) PRIMARY KEY,
        current_state    VARCHAR(50) DEFAULT 'START',
        product_id       INT,
        ad_source_id     VARCHAR(100),
        ctwa_clid        VARCHAR(255),
        session_data     JSON,
        last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Base de datos de clientes (capturada por el bot)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_clients (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        phone          VARCHAR(20) UNIQUE NOT NULL,
        full_name      VARCHAR(255),
        city           VARCHAR(100),
        province       VARCHAR(100),
        street1        VARCHAR(255),
        street2        VARCHAR(255),
        neighborhood   VARCHAR(255),
        reference      TEXT,
        cedula         VARCHAR(20),
        total_orders   INT DEFAULT 0,
        last_order_at  TIMESTAMP NULL,
        notes          TEXT,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Pedidos registrados por el bot
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_orders (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        client_phone     VARCHAR(20) NOT NULL,
        product_id       INT NOT NULL,
        product_name     VARCHAR(255),
        quantity         INT DEFAULT 1,
        unit_price       DECIMAL(10,2),
        total_price      DECIMAL(10,2),
        ad_source_id     VARCHAR(100),
        ctwa_clid        VARCHAR(255),
        client_name      VARCHAR(255),
        client_city      VARCHAR(100),
        client_street1   VARCHAR(255),
        client_street2   VARCHAR(255),
        client_neighborhood VARCHAR(255),
        client_reference TEXT,
        status           ENUM('pending','confirmed','dispatched','delivered','cancelled') DEFAULT 'pending',
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Log completo de mensajes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages_log (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        phone            VARCHAR(20) NOT NULL,
        direction        ENUM('in','out') NOT NULL,
        message_type     VARCHAR(50) DEFAULT 'text',
        content          TEXT,
        media_url        TEXT,
        state_at_time    VARCHAR(50),
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Tablas del chatbot de WhatsApp verificadas/creadas.');

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    if (connection) connection.release();
  }
}
