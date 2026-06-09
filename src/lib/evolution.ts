// =============================================
// Helper para Evolution API — Zamvaro Ecuador
// =============================================

const EVOLUTION_URL = process.env.EVOLUTION_API_URL!;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY!;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME!;

const evolutionHeaders = {
  'Content-Type': 'application/json',
  apikey: EVOLUTION_KEY,
};

async function evolutionFetch(endpoint: string, body: object) {
  const url = `${EVOLUTION_URL}${endpoint}/${EVOLUTION_INSTANCE}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: evolutionHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`[Evolution API] Error en ${endpoint}:`, err);
  }
  return res;
}

/** Normaliza el número de teléfono al formato que necesita Evolution (sin +) */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Envía un mensaje de texto simple */
export async function sendText(phone: string, text: string) {
  return evolutionFetch('/message/sendText', {
    number: normalizePhone(phone),
    text,
    delay: 1200, // milisegundos de "typing" antes de enviar
  });
}

/** Envía una imagen con caption opcional */
export async function sendImage(phone: string, imageUrl: string, caption?: string) {
  return evolutionFetch('/message/sendMedia', {
    number: normalizePhone(phone),
    mediatype: 'image',
    mimetype: 'image/jpeg',
    media: imageUrl,
    caption: caption || '',
  });
}

/** Envía un audio de WhatsApp (nota de voz) */
export async function sendAudio(phone: string, audioUrl: string) {
  return evolutionFetch('/message/sendWhatsAppAudio', {
    number: normalizePhone(phone),
    audio: audioUrl,
  });
}

/** Envía un documento */
export async function sendDocument(phone: string, docUrl: string, fileName: string) {
  return evolutionFetch('/message/sendMedia', {
    number: normalizePhone(phone),
    mediatype: 'document',
    media: docUrl,
    fileName,
  });
}

/** Transcribe un audio usando Groq Whisper API */
export async function transcribeAudio(audioUrl: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    // Descargar el audio primero
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return null;
    const audioBuffer = await audioRes.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.ogg');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'es');

    const transcribeRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: formData,
    });

    if (!transcribeRes.ok) {
      console.error('[Groq Whisper] Error:', await transcribeRes.text());
      return null;
    }

    const data = await transcribeRes.json();
    return data.text || null;
  } catch (err) {
    console.error('[Groq Whisper] Exception:', err);
    return null;
  }
}

/** Notifica a un número interno (Michael o Abel) por WhatsApp */
export async function notifyInternal(phone: string, message: string) {
  return sendText(phone, message);
}
