import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      subtitle,
      hookText,
      category,
      price,
      originalPrice,
      tag,
      emoji,
      image,
      images,
      imageProblem,
      imageFeatures,
      imageHowTo,
      isAvailable,
      slug,
      bullets,
      features,
      testimonials,
      comparisonTitle,
      comparisonOursLabel,
      comparisonTheirsLabel,
      comparison,
      stats,
      steps,
      faqs,
      guaranteeText,
      whatsappNumber,
      primaryColor,
      problemFactors,
      problemTagline,
      problemHeadline,
      facebookPixelId,
      template,
      promptProblem,
      promptFeatures,
      promptHowTo,
      promptGallery,
      referenceImages,
      aiText,
      landingButtons,
      promotions,
      showPriorityShipping,
      showDispatch24h,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: 'Nombre y Slug son requeridos' }, { status: 400 });
    }

    const query = `
      UPDATE products SET
        name = ?,
        subtitle = ?,
        hookText = ?,
        category = ?,
        price = ?,
        originalPrice = ?,
        tag = ?,
        emoji = ?,
        image = ?,
        images = ?,
        imageProblem = ?,
        imageFeatures = ?,
        imageHowTo = ?,
        isAvailable = ?,
        slug = ?,
        bullets = ?,
        features = ?,
        testimonials = ?,
        comparisonTitle = ?,
        comparisonOursLabel = ?,
        comparisonTheirsLabel = ?,
        comparison = ?,
        stats = ?,
        steps = ?,
        faqs = ?,
        guaranteeText = ?,
        whatsappNumber = ?,
        primaryColor = ?,
        problemFactors = ?,
        problemTagline = ?,
        problemHeadline = ?,
        facebookPixelId = ?,
        template = ?,
        promptProblem = ?,
        promptFeatures = ?,
        promptHowTo = ?,
        promptGallery = ?,
        referenceImages = ?,
        aiText = ?,
        landingButtons = ?,
        promotions = ?,
        showPriorityShipping = ?,
        showDispatch24h = ?
      WHERE id = ?
    `;

    await pool.query(query, [
      name,
      subtitle || null,
      hookText || null,
      category || null,
      price || '$0.00',
      originalPrice || null,
      tag || null,
      emoji || null,
      image || null,
      JSON.stringify(images || []),
      imageProblem || null,
      imageFeatures || null,
      imageHowTo || null,
      isAvailable ? 1 : 0,
      slug,
      JSON.stringify(bullets || []),
      JSON.stringify(features || []),
      JSON.stringify(testimonials || []),
      comparisonTitle || null,
      comparisonOursLabel || null,
      comparisonTheirsLabel || null,
      JSON.stringify(comparison || []),
      JSON.stringify(stats || []),
      JSON.stringify(steps || []),
      JSON.stringify(faqs || []),
      guaranteeText || null,
      whatsappNumber || null,
      primaryColor || null,
      JSON.stringify(problemFactors || []),
      problemTagline || null,
      problemHeadline || null,
      facebookPixelId || null,
      template || 'basica',
      promptProblem || null,
      promptFeatures || null,
      promptHowTo || null,
      promptGallery || null,
      JSON.stringify(referenceImages || []),
      aiText || null,
      JSON.stringify(landingButtons || []),
      JSON.stringify(promotions || []),
      showPriorityShipping !== false ? 1 : 0,
      showDispatch24h !== false ? 1 : 0,
      id,
    ]);

    return NextResponse.json({ success: true, message: 'Producto actualizado exitosamente' });
  } catch (error: any) {
    console.error('Error in PUT /api/products/[id]:', error);
    if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('Duplicate entry'))) {
      return NextResponse.json({ message: 'El slug ya está en uso por otro producto. Por favor, elige un slug diferente.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al actualizar producto', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json({ message: 'Error al eliminar producto', error: error.message }, { status: 500 });
  }
}
