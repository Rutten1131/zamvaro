// =============================================
// Motor del Chatbot — Zamvaro Ecuador
// Flujo basado en: SCRIPT MENSAJES Dropshipping.pdf
// =============================================

import pool from './db';
import {
  sendText,
  sendImage,
  notifyInternal,
  transcribeAudio,
} from './evolution';

// -----------------------------------------------
// TIPOS
// -----------------------------------------------

type BotState =
  | 'START'
  | 'AWAITING_CITY'
  | 'AWAITING_CONFIRM'
  | 'AWAITING_DATA'
  | 'VERIFYING_DATA'
  | 'COMPLETED';

interface Session {
  phone: string;
  current_state: BotState;
  product_id: number | null;
  ad_source_id: string | null;
  ctwa_clid: string | null;
  session_data: Record<string, any>;
}

interface IncomingMessage {
  phone: string;          // número del cliente
  text: string | null;    // texto del mensaje (ya transcrito si era audio)
  mediaUrl?: string;      // URL del media si aplica
  messageType: string;    // text | audio | image | document | sticker
  referral?: {
    source_id: string;
    source_type: string;
    headline?: string;
    body?: string;
    ctwa_clid?: string;
  };
  pushName?: string;      // nombre de WhatsApp del cliente
}

// -----------------------------------------------
// HELPERS DE RESPUESTA SI/NO
// -----------------------------------------------

const YES_KEYWORDS = ['si', 'sí', 'yes', 'dale', 'ok', 'claro', 'listo', 'quiero', 'procede', 'adelante', 'confirmo', 'confirmar', '✅', '👍', '1'];
const NO_KEYWORDS = ['no', 'cancel', 'cancelar', 'nop', 'nope', '❌', '👎'];

function isYes(text: string): boolean {
  const t = text.toLowerCase().trim();
  return YES_KEYWORDS.some(k => t.includes(k));
}

function isNo(text: string): boolean {
  const t = text.toLowerCase().trim();
  return NO_KEYWORDS.some(k => t.includes(k));
}

// -----------------------------------------------
// PASO 1: IDENTIFICACIÓN DEL PRODUCTO
// -----------------------------------------------

async function identifyProduct(sourceId: string, adHeadline?: string): Promise<number | null> {
  const conn = await pool.getConnection();
  try {
    // Buscar en caché local primero
    const [rows] = await conn.query(
      'SELECT product_id FROM ad_product_mapping WHERE ad_source_id = ?',
      [sourceId]
    ) as any;

    if (rows.length > 0) {
      return rows[0].product_id;
    }

    // No está en caché → consultar Meta Graph API
    const metaToken = process.env.META_ACCESS_TOKEN;
    if (!metaToken) return null;

    let adName = adHeadline || '';
    let campaignName = '';
    let adsetName = '';

    try {
      const metaRes = await fetch(
        `https://graph.facebook.com/v20.0/${sourceId}?fields=name,adset%7Bname%7D,campaign%7Bname%7D&access_token=${metaToken}`
      );
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        adName = metaData.name || adHeadline || '';
        campaignName = metaData.campaign?.name || '';
        adsetName = metaData.adset?.name || '';
      }
    } catch (e) {
      console.error('[Bot] Error consultando Meta API:', e);
    }

    // Fuzzy match contra nombres de productos en BD
    const [products] = await conn.query('SELECT id, name, slug FROM products WHERE isAvailable = 1') as any;

    let bestMatchId: number | null = null;
    let bestScore = 0;

    const searchText = `${adName} ${adsetName} ${campaignName}`.toLowerCase();

    for (const product of products) {
      const productName = (product.name as string).toLowerCase();
      const productSlug = (product.slug as string).toLowerCase();

      // Score simple: cuántas palabras del producto están en el texto del anuncio
      const words = productName.split(/\s+/);
      const matches = words.filter(w => w.length > 3 && searchText.includes(w)).length;
      const score = words.length > 0 ? (matches / words.length) * 100 : 0;

      if (score > bestScore) {
        bestScore = score;
        bestMatchId = product.id;
      }

      // También revisar si el slug aparece en el texto
      if (searchText.includes(productSlug)) {
        bestMatchId = product.id;
        bestScore = 100;
      }
    }

    // Guardar en tabla de mapeo (confirmado si score > 70)
    if (bestMatchId !== null) {
      await conn.query(
        `INSERT INTO ad_product_mapping (ad_source_id, product_id, ad_name, campaign_name, adset_name, match_score, is_confirmed)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE product_id=VALUES(product_id), match_score=VALUES(match_score)`,
        [sourceId, bestMatchId, adName, campaignName, adsetName, bestScore, bestScore >= 70]
      );

      // Si el score es bajo, notificar al equipo para confirmación manual
      if (bestScore < 70) {
        const michaelPhone = process.env.BOT_NOTIFY_MICHAEL;
        if (michaelPhone) {
          await notifyInternal(
            michaelPhone,
            `⚠️ *NUEVO ANUNCIO SIN MAPEO*\n\nID: ${sourceId}\nNombre: ${adName}\nConjunto: ${adsetName}\nCampaña: ${campaignName}\n\nConfianza del match automático: ${bestScore.toFixed(0)}%\nProducto asignado: ID ${bestMatchId} (revisar en panel admin)`
          );
        }
      }

      return bestScore >= 50 ? bestMatchId : null;
    }

    return null;
  } finally {
    conn.release();
  }
}

// -----------------------------------------------
// PASO 2: GESTIÓN DE SESIÓN
// -----------------------------------------------

async function getOrCreateSession(phone: string): Promise<Session> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM whatsapp_sessions WHERE phone = ?',
      [phone]
    ) as any;

    if (rows.length > 0) {
      const row = rows[0];
      return {
        phone: row.phone,
        current_state: row.current_state,
        product_id: row.product_id,
        ad_source_id: row.ad_source_id,
        ctwa_clid: row.ctwa_clid,
        session_data: typeof row.session_data === 'string'
          ? JSON.parse(row.session_data)
          : (row.session_data || {}),
      };
    }

    // Crear sesión nueva
    await conn.query(
      `INSERT INTO whatsapp_sessions (phone, current_state, session_data) VALUES (?, 'START', '{}')`,
      [phone]
    );

    return {
      phone,
      current_state: 'START',
      product_id: null,
      ad_source_id: null,
      ctwa_clid: null,
      session_data: {},
    };
  } finally {
    conn.release();
  }
}

async function updateSession(phone: string, updates: Partial<Session>) {
  const conn = await pool.getConnection();
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.current_state !== undefined) {
      fields.push('current_state = ?');
      values.push(updates.current_state);
    }
    if (updates.product_id !== undefined) {
      fields.push('product_id = ?');
      values.push(updates.product_id);
    }
    if (updates.ad_source_id !== undefined) {
      fields.push('ad_source_id = ?');
      values.push(updates.ad_source_id);
    }
    if (updates.ctwa_clid !== undefined) {
      fields.push('ctwa_clid = ?');
      values.push(updates.ctwa_clid);
    }
    if (updates.session_data !== undefined) {
      fields.push('session_data = ?');
      values.push(JSON.stringify(updates.session_data));
    }

    fields.push('last_interaction = NOW()');
    values.push(phone);

    await conn.query(
      `UPDATE whatsapp_sessions SET ${fields.join(', ')} WHERE phone = ?`,
      values
    );
  } finally {
    conn.release();
  }
}

// -----------------------------------------------
// PASO 3: CARGAR PRODUCTO DESDE BD
// -----------------------------------------------

async function getProduct(productId: number) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [productId]) as any;
    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    };
  } finally {
    conn.release();
  }
}

// -----------------------------------------------
// PASO 4: LOG DE MENSAJES
// -----------------------------------------------

async function logMessage(
  phone: string,
  direction: 'in' | 'out',
  messageType: string,
  content: string,
  state: string,
  mediaUrl?: string
) {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO whatsapp_messages_log (phone, direction, message_type, content, media_url, state_at_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [phone, direction, messageType, content?.substring(0, 2000), mediaUrl || null, state]
    );
  } catch (e) {
    // No bloquear el flujo si falla el log
    console.error('[Bot] Error guardando log:', e);
  } finally {
    conn.release();
  }
}

// -----------------------------------------------
// PASO 5: GUARDAR PEDIDO Y NOTIFICAR AL EQUIPO
// -----------------------------------------------

async function saveOrderAndNotify(session: Session, product: any) {
  const data = session.session_data;
  const price = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;

  const conn = await pool.getConnection();
  try {
    // Guardar pedido
    await conn.query(
      `INSERT INTO whatsapp_orders
        (client_phone, product_id, product_name, unit_price, total_price, ad_source_id, ctwa_clid,
         client_name, client_city, client_street1, client_street2, client_neighborhood, client_reference, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        session.phone,
        product.id,
        product.name,
        price,
        price,
        session.ad_source_id || null,
        session.ctwa_clid || null,
        data.nombre || null,
        data.ciudad || null,
        data.calle1 || null,
        data.calle2 || null,
        data.barrio || null,
        data.referencia || null,
      ]
    );

    // Guardar/actualizar cliente
    await conn.query(
      `INSERT INTO whatsapp_clients (phone, full_name, city, street1, street2, neighborhood, reference, total_orders, last_order_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE
         full_name = COALESCE(VALUES(full_name), full_name),
         city = COALESCE(VALUES(city), city),
         street1 = COALESCE(VALUES(street1), street1),
         street2 = COALESCE(VALUES(street2), street2),
         neighborhood = COALESCE(VALUES(neighborhood), neighborhood),
         reference = COALESCE(VALUES(reference), reference),
         total_orders = total_orders + 1,
         last_order_at = NOW()`,
      [
        session.phone,
        data.nombre || null,
        data.ciudad || null,
        data.calle1 || null,
        data.calle2 || null,
        data.barrio || null,
        data.referencia || null,
      ]
    );
  } finally {
    conn.release();
  }

  // Notificar a Michael y Abel por WhatsApp
  const notifyMsg =
    `🛒 *NUEVO PEDIDO CONFIRMADO* ✅\n\n` +
    `👤 Cliente: ${data.nombre || 'Sin nombre'}\n` +
    `📱 WhatsApp: ${session.phone}\n` +
    `📦 Producto: ${product.name}\n` +
    `💵 Total: ${product.price}\n` +
    `📍 Ciudad: ${data.ciudad || '—'}\n` +
    `🏠 Calle 1: ${data.calle1 || '—'}\n` +
    `🏠 Calle 2: ${data.calle2 || '—'}\n` +
    `🏘️ Barrio/Ref: ${data.barrio || '—'} / ${data.referencia || '—'}\n\n` +
    `✅ Datos verificados por el cliente.\n` +
    `Por favor procesar guía en Dropi/EFFI.`;

  const michaelPhone = process.env.BOT_NOTIFY_MICHAEL;
  const abelPhone = process.env.BOT_NOTIFY_ABEL;

  if (michaelPhone) await notifyInternal(michaelPhone, notifyMsg);
  if (abelPhone) await notifyInternal(abelPhone, notifyMsg);

  console.log(`[Bot] Pedido guardado y equipo notificado para cliente ${session.phone}`);
}

// -----------------------------------------------
// PASO 6: MANEJO DE ESTADOS (Script PDF)
// -----------------------------------------------

async function handleState(session: Session, msg: IncomingMessage, product: any | null) {
  const { phone, current_state } = session;
  const text = (msg.text || '').trim();

  switch (current_state) {

    // ─────────────────────────────────
    // ESTADO START → Mensaje #1 del PDF
    // ─────────────────────────────────
    case 'START': {
      const greeting = product
        ? `Hola, ¿para qué ciudad necesita el *${product.name}*?`
        : `Hola, ¿para qué ciudad necesita el producto?`;

      await sendText(phone, greeting);
      await logMessage(phone, 'out', 'text', greeting, 'START');
      await updateSession(phone, { current_state: 'AWAITING_CITY' });
      break;
    }

    // ─────────────────────────────────────────────────────
    // ESTADO AWAITING_CITY → Mensaje #2 del PDF + imagen
    // ─────────────────────────────────────────────────────
    case 'AWAITING_CITY': {
      if (!text) {
        await sendText(phone, '¿Para qué ciudad necesita el producto?');
        break;
      }

      // Guardar ciudad
      const newData = { ...session.session_data, ciudad: text };
      await updateSession(phone, {
        current_state: 'AWAITING_CONFIRM',
        session_data: newData,
      });

      // Construir mensaje de oferta con precio del producto
      const price = product ? product.price : '$25';
      const offerMsg =
        `Con gusto, el envío a su ciudad es gratuito y *PAGA AL RECIBIR* el producto.\n\n` +
        `💵 Total: *${price} dólares*\n` +
        `🚚 Su producto llega en *2 - 3 días laborables.*\n\n` +
        `¿Desea que le haga su guía con pago al recibir?`;

      // Enviar imagen del producto primero (si tiene)
      if (product?.image) {
        await sendImage(phone, product.image, product.name);
        await logMessage(phone, 'out', 'image', product.image, 'AWAITING_CITY', product.image);
      }

      await sendText(phone, offerMsg);
      await logMessage(phone, 'out', 'text', offerMsg, 'AWAITING_CITY');
      break;
    }

    // ──────────────────────────────────────────────────────────────────
    // ESTADO AWAITING_CONFIRM → Si dice Sí → Mensaje #3: Pedir Datos
    // ──────────────────────────────────────────────────────────────────
    case 'AWAITING_CONFIRM': {
      if (!text) break;

      if (isYes(text)) {
        const dataRequestMsg =
          `Listo ✅ necesito los siguientes datos para procesar su guía:\n\n` +
          `🚛 Las entregas se realizan de 9 a 17 horas, coloque la dirección donde estará en ese horario:\n\n` +
          `*Nombre y Apellido:*\n` +
          `*Dirección (2 calles):*\n` +
          `*Referencia o Barrio:*\n` +
          `*Celular (al que recibe llamadas):*`;

        await sendText(phone, dataRequestMsg);
        await logMessage(phone, 'out', 'text', dataRequestMsg, 'AWAITING_CONFIRM');
        await updateSession(phone, { current_state: 'AWAITING_DATA' });
      } else if (isNo(text)) {
        await sendText(phone, '¿Esto es lo que estabas buscando o quieres ver otra opción? 😊');
        await logMessage(phone, 'out', 'text', 'Respuesta negativa - quita visto', 'AWAITING_CONFIRM');
      } else {
        // Respuesta ambigua → repreguntar
        await sendText(phone, '¿Desea que le hagamos su guía de envío gratis con pago al recibir? Solo responda *SÍ* ✅');
      }
      break;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ESTADO AWAITING_DATA → Recibir datos del cliente → Mensaje #4: Verificar
    // ──────────────────────────────────────────────────────────────────────────
    case 'AWAITING_DATA': {
      if (!text) {
        await sendText(phone, 'Por favor envíeme los datos para procesar su guía:\n\n*Nombre y Apellido:*\n*Dirección (2 calles):*\n*Referencia o Barrio:*\n*Celular:*');
        break;
      }

      // Parseo básico: intentamos extraer los campos por líneas o palabras clave
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const parsedData: Record<string, string> = {};

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('nombre')) {
          parsedData.nombre = line.replace(/^nombre[^:]*:\s*/i, '').trim();
        } else if (lower.startsWith('direcci')) {
          const direccion = line.replace(/^direcci[^:]*:\s*/i, '').trim();
          const calles = direccion.split(/y|&|\//).map(c => c.trim());
          parsedData.calle1 = calles[0] || direccion;
          parsedData.calle2 = calles[1] || '';
        } else if (lower.startsWith('referencia') || lower.startsWith('barrio')) {
          parsedData.barrio = line.replace(/^(referencia|barrio)[^:]*:\s*/i, '').trim();
        } else if (lower.startsWith('celular') || lower.startsWith('telf') || lower.startsWith('tel')) {
          parsedData.celular = line.replace(/^(celular|telf|tel)[^:]*:\s*/i, '').trim();
        }
      }

      // Si no se pudo parsear bien, guardar el texto completo para revisión manual
      if (!parsedData.nombre && lines.length >= 1) parsedData.nombre = lines[0];
      if (!parsedData.calle1 && lines.length >= 2) parsedData.calle1 = lines[1];
      if (!parsedData.barrio && lines.length >= 3) parsedData.barrio = lines[2];
      if (!parsedData.celular && lines.length >= 4) parsedData.celular = lines[3];

      const newData: Record<string, any> = { ...session.session_data, ...parsedData, raw_data: text };
      await updateSession(phone, { current_state: 'VERIFYING_DATA', session_data: newData });

      // Mensaje #4: mostrar resumen para confirmar
      const summary =
        `Por favor revise si los datos de su guía están correctos para *CONFIRMAR SU DESPACHO*:\n\n` +
        `👤 *Nombre:* ${parsedData.nombre || '—'}\n` +
        `🏠 *Calle 1:* ${parsedData.calle1 || '—'}\n` +
        `🏠 *Calle 2:* ${parsedData.calle2 || '—'}\n` +
        `🏘️ *Barrio/Ref:* ${parsedData.barrio || '—'}\n` +
        `📱 *Celular:* ${parsedData.celular || '—'}\n` +
        `📍 *Ciudad:* ${newData.ciudad || '—'}\n\n` +
        `Verifique que la dirección sea correcta, las entregas son de lunes a viernes de 9 a 17 horas.\n\n` +
        `¿Los datos son correctos? Responda *SÍ* para confirmar ✅`;

      await sendText(phone, summary);
      await logMessage(phone, 'out', 'text', summary, 'AWAITING_DATA');
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ESTADO VERIFYING_DATA → Si confirma → Mensaje #5 + guardar pedido + notificar
    // ─────────────────────────────────────────────────────────────────────────────
    case 'VERIFYING_DATA': {
      if (!text) break;

      if (isYes(text)) {
        if (!product) {
          await sendText(phone, 'Hubo un error al procesar su pedido. Por favor contáctenos directamente.');
          break;
        }

        // Guardar pedido en BD y notificar a Michael y Abel
        await saveOrderAndNotify(session, product);

        // Calcular días estimados (según ciudad capital = 1 día, cantón = 2, parroquia = 2-3)
        const dispatchMsg =
          `✅ Listo, en este momento hemos confirmado su *DESPACHO*.\n\n` +
          `🚨 Por favor recuerde que el envío ya lo hemos pagado nosotros 🚨\n\n` +
          `Por favor estar pendiente en los próximos *2 a 3 días laborables* a su celular, que le llamarán para entregarle su producto.\n\n` +
          `*TOTAL A CANCELAR: ${product.price} dólares* (sólo se acepta efectivo)\n\n` +
          `¡Gracias por su confianza en Zamvaro Ecuador! 🙌`;

        await sendText(phone, dispatchMsg);
        await logMessage(phone, 'out', 'text', dispatchMsg, 'VERIFYING_DATA');
        await updateSession(phone, { current_state: 'COMPLETED' });

      } else if (isNo(text)) {
        // Cliente quiere corregir datos
        await sendText(
          phone,
          'No hay problema, por favor envíeme los datos corregidos:\n\n*Nombre y Apellido:*\n*Dirección (2 calles):*\n*Referencia o Barrio:*\n*Celular:*'
        );
        await updateSession(phone, { current_state: 'AWAITING_DATA' });
      } else {
        await sendText(phone, '¿Los datos son correctos? Responda *SÍ* para confirmar o *NO* para corregirlos.');
      }
      break;
    }

    // ─────────────────────────────────
    // ESTADO COMPLETED
    // ─────────────────────────────────
    case 'COMPLETED': {
      // Pedido ya completado, responder amablemente
      await sendText(
        phone,
        '¡Su pedido ya está confirmado! 🎉\n\nRecuerde tener su dinero en efectivo listo para el momento de la entrega.\n\nSi tiene alguna pregunta sobre su producto, con gusto le ayudamos. 😊'
      );
      break;
    }

    default:
      await sendText(phone, 'Hola, ¿en qué le podemos ayudar hoy?');
      await updateSession(phone, { current_state: 'START' });
  }
}

// -----------------------------------------------
// FUNCIÓN PRINCIPAL: PROCESAR MENSAJE ENTRANTE
// -----------------------------------------------

export async function processMessage(evolutionPayload: any) {
  try {
    const data = evolutionPayload?.data;
    if (!data) return;

    // Ignorar mensajes propios
    if (data.key?.fromMe === true) return;

    // Extraer número del remitente
    const remoteJid: string = data.key?.remoteJid || '';
    if (!remoteJid || remoteJid.includes('@g.us')) return; // ignorar grupos

    const phone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    if (!phone) return;

    // Extraer tipo y contenido del mensaje
    const message = data.message || {};
    const pushName = data.pushName || '';
    let messageType = data.messageType || 'text';
    let textContent: string | null = null;
    let mediaUrl: string | null = null;

    // Texto simple
    if (message.conversation) {
      textContent = message.conversation;
    }
    // Texto extendido
    else if (message.extendedTextMessage?.text) {
      textContent = message.extendedTextMessage.text;
    }
    // Audio → transcribir con Groq Whisper
    else if (message.audioMessage || messageType === 'audioMessage') {
      messageType = 'audio';
      mediaUrl = data.message?.audioMessage?.url || data.mediaUrl || null;
      if (mediaUrl) {
        textContent = await transcribeAudio(mediaUrl);
        if (!textContent) {
          await sendText(phone, 'Hola, le pido disculpas, no pude escuchar bien su audio. ¿Podría escribirme su mensaje? 😊');
          return;
        }
      }
    }
    // Imagen
    else if (message.imageMessage || messageType === 'imageMessage') {
      messageType = 'image';
      mediaUrl = data.mediaUrl || null;
      textContent = message.imageMessage?.caption || null;
    }
    // Sticker → tratarlo como respuesta positiva de contexto
    else if (messageType === 'stickerMessage') {
      textContent = 'sí';
    }

    // Extraer referral (solo en el primer mensaje desde un anuncio)
    const referral = message.extendedTextMessage?.contextInfo?.referralData
      || data.referral
      || null;

    const incomingMsg: IncomingMessage = {
      phone,
      text: textContent,
      mediaUrl: mediaUrl || undefined,
      messageType,
      pushName,
      referral: referral ? {
        source_id: referral.source_id || referral.sourceId || '',
        source_type: referral.source_type || referral.sourceType || 'ad',
        headline: referral.headline || '',
        body: referral.body || '',
        ctwa_clid: referral.ctwa_clid || referral.ctwaClid || '',
      } : undefined,
    };

    // Loguear mensaje entrante
    await logMessage(phone, 'in', messageType, textContent || '[media]', 'incoming', mediaUrl || undefined);

    // Obtener o crear sesión
    const session = await getOrCreateSession(phone);

    // Si hay referral y no hay producto asignado → identificar producto
    if (referral?.source_id && !session.product_id) {
      const productId = await identifyProduct(referral.source_id, referral.headline);
      if (productId) {
        await updateSession(phone, {
          product_id: productId,
          ad_source_id: referral.source_id,
          ctwa_clid: referral.ctwa_clid || null,
        });
        session.product_id = productId;
        session.ad_source_id = referral.source_id;
        session.ctwa_clid = referral.ctwa_clid || null;
      }
    }

    // Cargar producto
    let product: any = null;
    if (session.product_id) {
      product = await getProduct(session.product_id);
    }

    // Ejecutar lógica del estado actual
    await handleState(session, incomingMsg, product);

  } catch (err) {
    console.error('[Bot] Error procesando mensaje:', err);
  }
}
