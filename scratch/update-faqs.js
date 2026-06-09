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
    
    const shortFaqs = [
      {
        question: '¿Necesita sol directo para cargarse?',
        answer: 'No, su panel solar avanzado se recarga con cualquier tipo de luz, natural o artificial de tu baño.'
      },
      {
        question: '¿La luz UV es segura para la familia?',
        answer: 'Sí. Cuenta con sensor de movimiento inteligente que apaga la luz UV automáticamente cuando alguien se acerca.'
      },
      {
        question: '¿Qué tipo de pasta dental puedo usar?',
        answer: 'El dispensador es compatible con la gran mayoría de pastas dentales estándar del mercado.'
      },
      {
        question: '¿El envío es gratis y cómo pago?',
        answer: 'Sí. Envío totalmente gratis a todo Ecuador y pagas contra entrega en efectivo al recibir en tu puerta.'
      },
      {
        question: '¿Es difícil de instalar?',
        answer: 'Para nada. Se instala en 2 minutos con el adhesivo ultra resistente incluido, sin usar herramientas ni taladros.'
      }
    ];
    
    console.log('Updating FAQs in DB...');
    const [result] = await pool.query(
      'UPDATE products SET faqs = ? WHERE slug = ?',
      [JSON.stringify(shortFaqs), slug]
    );
    
    console.log('Update result:', result);
  } catch (err) {
    console.error('Error during FAQ database update:', err);
  } finally {
    await pool.end();
  }
}

main();
