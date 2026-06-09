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
    const [rows] = await pool.query('SELECT * FROM products WHERE slug = ?', ['soporte-esterilizador-uv-inteligente-para-cepillos-de-dientes']);
    console.log(JSON.stringify(rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
