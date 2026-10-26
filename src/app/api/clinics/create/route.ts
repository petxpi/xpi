import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clinicId, name, slug, ownerName, email, phone, 
      address, city, country, logoUrl, businessImageUrl, specialty 
    } = body;

    if (!clinicId || !name || !slug || !ownerName || !email) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Validar formato del slug
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
      return NextResponse.json({ 
        message: "El slug solo puede contener letras minúsculas, números y guiones (mínimo 3 caracteres)" 
      }, { status: 400 });
    }

    // Validar que el slug no exista
    const existing = await query(
      "SELECT id FROM clinics WHERE slug = ?",
      [slug]
    );

    if (existing.rows && existing.rows.length > 0) {
      return NextResponse.json({ 
        message: "Este slug ya está en uso. Elige otro." 
      }, { status: 400 });
    }

    await query(
      `UPDATE clinics 
       SET name = ?, slug = ?, owner_name = ?, email = ?, phone = ?, 
           address = ?, city = ?, country = ?, logo_url = ?, 
           business_image_url = ?, specialty = ?, status = 'pending',
           updated_at = datetime('now')
       WHERE id = ?`,
      [name, slug, ownerName, email, phone || '', address || '', city || '', country || 'Colombia', logoUrl || '', businessImageUrl || '', specialty || '', clinicId]
    );

    return NextResponse.json({ 
      message: "Clínica creada exitosamente. Pendiente de aprobación.",
      clinicId,
      slug
    });
  } catch (error) {
    console.error("Error al crear clínica:", error);
    return NextResponse.json({ message: "Error al crear clínica" }, { status: 500 });
  }
}