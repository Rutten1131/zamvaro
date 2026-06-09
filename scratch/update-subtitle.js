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
    const newSubtitle = 'Transforma tu baño en un santuario de higiene y modernidad.';
    
    console.log(`Updating subtitle for slug: ${slug}`);
    const [result] = await pool.query(
      'UPDATE products SET subtitle = ? WHERE slug = ?',
      [newSubtitle, slug]
    );
    
    console.log('Update result:', result);
  } catch (err) {
    console.error('Error updating product subtitle:', err);
  } finally {
    await pool.end();
  }
}

main();
