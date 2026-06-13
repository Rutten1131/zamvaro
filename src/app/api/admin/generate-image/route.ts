import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import https from 'https';

/** Sube buffer a Bunny.net CDN usando https nativo */
function uploadToBunnyStorage(
  storageZone: string,
  folder: string,
  filename: string,
  apiKey: string,
  buffer: Buffer
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'storage.bunnycdn.com',
      port: 443,
      path: `/${storageZone}/${folder}/${filename}`,
      method: 'PUT',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length,
      },
      timeout: 60000,
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) resolve();
        else reject(new Error(`Bunny.net ${res.statusCode}: ${body}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Bunny.net timeout')); });
    req.write(buffer);
    req.end();
  });
}

/** POST con https nativo — devuelve Buffer con la respuesta */
function httpsPost(
  hostname: string,
  path: string,
  headers: Record<string, string>,
  bodyData: string,
  timeoutMs = 120000
): Promise<{ statusCode: number; contentType: string; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyData) },
      timeout: timeoutMs,
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          contentType: (res.headers['content-type'] || '') as string,
          body: Buffer.concat(chunks),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout conectando a ${hostname}`)); });
    req.write(bodyData);
    req.end();
  });
}

/**
 * Genera imagen con HuggingFace Router (router.huggingface.co).
 * Usa FLUX.1-schnell y modelos actuales — el dominio api-inference.huggingface.co
 * está bloqueado por DNS, pero router.huggingface.co sí es alcanzable.
 */
async function generateWithHuggingFace(prompt: string, token: string): Promise<Buffer> {
  // Solo usar router.huggingface.co — la URL vieja está bloqueada por DNS en esta red
  const endpoints = [
    {
      hostname: 'router.huggingface.co',
      path: '/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      label: 'FLUX.1-schnell',
      body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4, guidance_scale: 3.5 } }),
    },
    {
      hostname: 'router.huggingface.co',
      path: '/hf-inference/models/black-forest-labs/FLUX.1-dev',
      label: 'FLUX.1-dev',
      body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 20, guidance_scale: 3.5 } }),
    },
    {
      hostname: 'router.huggingface.co',
      path: '/hf-inference/models/stabilityai/stable-diffusion-3.5-medium',
      label: 'SD3.5-medium',
      body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 28, guidance_scale: 7.0 } }),
    },
  ];

  const baseHeaders: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Wait-For-Model': 'true',
  };

  for (const ep of endpoints) {
    console.log(`[HuggingFace] Probando ${ep.label}...`);
    try {
      const result = await httpsPost(ep.hostname, ep.path, baseHeaders, ep.body, 120000);
      console.log(`[HuggingFace] ${ep.label} → status ${result.statusCode}, type: ${result.contentType.substring(0, 50)}`);

      if (result.statusCode === 200 && result.contentType.includes('image')) {
        if (result.body.byteLength < 5000) {
          console.warn(`[HuggingFace] ${ep.label} imagen vacía: ${result.body.byteLength} bytes`);
          continue;
        }
        console.log(`[HuggingFace] ✅ ${ep.label}: ${result.body.byteLength} bytes`);
        return result.body;
      }

      const errMsg = result.body.toString('utf8').substring(0, 300);
      console.warn(`[HuggingFace] ${ep.label} error ${result.statusCode}: ${errMsg}`);

    } catch (e: any) {
      console.warn(`[HuggingFace] ${ep.label} error de red: ${e.message?.substring(0, 120)}`);
    }
  }

  throw new Error('Todos los modelos de HuggingFace fallaron');
}


export async function POST(request: Request) {
  let promptText = '(no prompt)';
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado — vuelve a iniciar sesión en /admin' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, productSlug } = body;
    promptText = prompt || '';

    if (!prompt) {
      return NextResponse.json({ message: 'El prompt es requerido' }, { status: 400 });
    }

    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'zamvaro';
    const bunnyApiKey = process.env.BUNNY_API_KEY;
    const pullZone = process.env.BUNNY_PULL_ZONE || 'https://zamvaro.b-cdn.net/';

    if (!bunnyApiKey) {
      return NextResponse.json({ message: 'Falta BUNNY_API_KEY en .env.local' }, { status: 500 });
    }

    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
    if (!hfToken) {
      return NextResponse.json({
        message: 'Falta HF_TOKEN en .env.local. Obtén uno gratis en huggingface.co/settings/tokens'
      }, { status: 500 });
    }

    const folderSlug = (productSlug || 'general')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-ai.jpg`;

    console.log(`[generate-image] Producto: ${folderSlug}`);
    console.log(`[generate-image] Prompt: ${prompt.substring(0, 80)}...`);

    const buffer = await generateWithHuggingFace(prompt, hfToken);

    console.log(`[generate-image] Subiendo a Bunny.net: ${folderSlug}/${uniqueFilename}`);
    await uploadToBunnyStorage(storageZone, folderSlug, uniqueFilename, bunnyApiKey, buffer);

    const baseUrl = pullZone.endsWith('/') ? pullZone : `${pullZone}/`;
    const url = `${baseUrl}${folderSlug}/${uniqueFilename}`;

    console.log(`[generate-image] ✅ URL: ${url}`);
    return NextResponse.json({ success: true, url });

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error(`[generate-image] ❌ Error final:`, errorMsg);
    return NextResponse.json({ message: `Error al generar: ${errorMsg}` }, { status: 500 });
  }
}
