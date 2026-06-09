import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'mappings') {
      const [mappings] = await pool.query('SELECT * FROM ad_product_mapping ORDER BY created_at DESC');
      return NextResponse.json(mappings);
    }

    if (action === 'sessions') {
      const [sessions] = await pool.query(`
        SELECT s.*, p.name as product_name 
        FROM whatsapp_sessions s
        LEFT JOIN products p ON s.product_id = p.id
        ORDER BY s.last_interaction DESC 
        LIMIT 100
      `);
      return NextResponse.json(sessions);
    }

    if (action === 'clients') {
      const [clients] = await pool.query('SELECT * FROM whatsapp_clients ORDER BY created_at DESC LIMIT 100');
      return NextResponse.json(clients);
    }

    if (action === 'orders') {
      const [orders] = await pool.query('SELECT * FROM whatsapp_orders ORDER BY created_at DESC LIMIT 100');
      return NextResponse.json(orders);
    }

    // Default dashboard statistics
    const [statsResult] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM whatsapp_sessions) as total_sessions,
        (SELECT COUNT(*) FROM whatsapp_clients) as total_clients,
        (SELECT COUNT(*) FROM whatsapp_orders) as total_orders,
        (SELECT COUNT(*) FROM whatsapp_orders WHERE status = 'confirmed') as confirmed_orders
    `);
    
    const stats = (statsResult as any)[0] || { total_sessions: 0, total_clients: 0, total_orders: 0, confirmed_orders: 0 };
    
    const [recentMessages] = await pool.query(`
      SELECT * FROM whatsapp_messages_log 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    const [mappings] = await pool.query('SELECT * FROM ad_product_mapping ORDER BY created_at DESC');

    return NextResponse.json({
      success: true,
      stats,
      recentMessages,
      mappings
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/chatbot:', error);
    return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { ad_source_id, product_id, ad_name, campaign_name, adset_name, is_confirmed } = body;

    if (!ad_source_id || !product_id) {
      return NextResponse.json({ message: 'ad_source_id y product_id son requeridos' }, { status: 400 });
    }

    // Insert or Update Mapping
    const query = `
      INSERT INTO ad_product_mapping (ad_source_id, product_id, ad_name, campaign_name, adset_name, is_confirmed)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        product_id = VALUES(product_id),
        ad_name = VALUES(ad_name),
        campaign_name = VALUES(campaign_name),
        adset_name = VALUES(adset_name),
        is_confirmed = VALUES(is_confirmed)
    `;

    await pool.query(query, [
      ad_source_id,
      product_id,
      ad_name || null,
      campaign_name || null,
      adset_name || null,
      is_confirmed ? 1 : 0
    ]);

    return NextResponse.json({ success: true, message: 'Mapeo guardado con éxito' });
  } catch (error: any) {
    console.error('Error in POST /api/admin/chatbot:', error);
    return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ad_source_id = searchParams.get('ad_source_id');

    if (!ad_source_id) {
      return NextResponse.json({ message: 'ad_source_id es requerido' }, { status: 400 });
    }

    await pool.query('DELETE FROM ad_product_mapping WHERE ad_source_id = ?', [ad_source_id]);

    return NextResponse.json({ success: true, message: 'Mapeo eliminado con éxito' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/chatbot:', error);
    return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
  }
}
