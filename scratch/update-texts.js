const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'mysql.us.stackcp.com',
    port: 40940,
    user: 'productos-3531303025fe',
    password: '[)k05w,8Cq96',
    database: 'productos-3531303025fe',
  });

  try {
    const slug = 'soporte-esterilizador-uv-inteligente-para-cepillos-de-dientes';
    
    // 1. Fetch current product data
    const [rows] = await pool.query('SELECT hookText, testimonials FROM products WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      console.log('Product not found!');
      return;
    }
    
    const product = rows[0];
    
    // 2. Shorten hookText
    const newHookText = '¡Dile adiós a las bacterias y al desorden en tu baño!';
    
    // 3. Shorten first testimonial
    let testimonials = [];
    if (product.testimonials) {
      testimonials = typeof product.testimonials === 'string' 
        ? JSON.parse(product.testimonials) 
        : product.testimonials;
    }
    
    if (testimonials.length > 0) {
      testimonials[0].text = '¡Increíble! Mi baño se ve ordenado y limpio, y el dispensador es una maravilla. ¡Totalmente recomendado!';
    }
    
    console.log('Updating database fields...');
    const [result] = await pool.query(
      'UPDATE products SET hookText = ?, testimonials = ? WHERE slug = ?',
      [newHookText, JSON.stringify(testimonials), slug]
    );
    
    console.log('Update result:', result);
  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await pool.end();
  }
}

main();
