import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import https from 'https';

// Función para subir a Bunny.net usando el módulo nativo 'https' para evitar timeouts de undici (fetch)
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
      // Deshabilitar timeout corto para cargas pesadas
      timeout: 60000, 
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve();
        } else {
          reject(new Error(`Bunny.net respondió con estado ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Tiempo de espera agotado al conectar con Bunny.net'));
    });

    // Escribir el buffer binario
    req.write(buffer);
    req.end();
  });
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Obtener y limpiar el slug del producto para la carpeta
    const productSlug = formData.get('productSlug') as string || 'general';
    const cleanFolder = productSlug
      .toLowerCase()
      .normalize('NFD') // Eliminar acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-') // Solo permitir letras y números en el nombre de la carpeta
      .replace(/-+/g, '-');

    // Generar nombre de archivo único
    const timestamp = Date.now();
    const cleanFilename = file.name
      .toLowerCase()
      .normalize('NFD') // Eliminar acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/g, '-') // Reemplazar caracteres especiales y espacios
      .replace(/-+/g, '-'); // Agrupar guiones repetidos
    
    const uniqueFilename = `${timestamp}-${cleanFilename}`;

    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'zamvaro';
    const apiKey = process.env.BUNNY_API_KEY;
    const pullZone = process.env.BUNNY_PULL_ZONE || 'https://zamvaro.b-cdn.net/';

    if (!apiKey) {
      throw new Error('Falta configurar BUNNY_API_KEY en .env.local');
    }

    // Subir usando HTTPS nativo
    await uploadToBunnyStorage(storageZone, cleanFolder, uniqueFilename, apiKey, buffer);

    // Retornar la URL directa del CDN (Pull Zone) con la carpeta incluida
    const baseUrl = pullZone.endsWith('/') ? pullZone : `${pullZone}/`;
    const url = `${baseUrl}${cleanFolder}/${uniqueFilename}`;

    console.log(`✅ Imagen subida exitosamente a Bunny.net en la carpeta /${cleanFolder}: ${url}`);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Error in /api/upload:', error);
    return NextResponse.json({ message: 'Error al subir imagen', error: error.message }, { status: 500 });
  }
}
