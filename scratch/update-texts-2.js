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
    const newGuaranteeText = 'En Zamvaro Ecuador, tu satisfacción es nuestra prioridad. Si por alguna razón nuestro Soporte Esterilizador UV no cumple tus expectativas, contáctanos y te daremos una solución rápida y sin complicaciones.';
    
    console.log('Updating guaranteeText in DB...');
    const [result] = await pool.query(
      'UPDATE products SET guaranteeText = ? WHERE slug = ?',
      [newGuaranteeText, slug]
    );
    
    console.log('Update result:', result);
  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await pool.end();
  }
}

main();
