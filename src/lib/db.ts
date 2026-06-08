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
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    if (connection) connection.release();
  }
}
