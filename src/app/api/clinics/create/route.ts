import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Datos recibidos:", body);

    const { 
      name, slug, ownerName, email, phone, 
      address, city, country, logoUrl, businessImageUrl, specialty 
    } = body;

    // Validaciones
    if (!name || !slug || !ownerName || !email) {
      return NextResponse.json({ 
        message: "Faltan campos obligatorios" 
      }, { status: 400 });
    }

    // Validar slug
    if (!/^[a-z0-9-]{3,}$/.test(slug)) {
      return NextResponse.json({ 
        message: `Slug inválido: "${slug}". Usá solo letras minúsculas, números y guiones (mínimo 3 caracteres).` 
      }, { status: 400 });
    }

    // Buscar la clínica existente por email
    const existing = await query(
      "SELECT id, slug FROM clinics WHERE email = ?",
      [email]
    );

    let clinicId: string;

    if (existing.rows && existing.rows.length > 0) {
      // Ya existe, actualizar
      clinicId = (existing.rows[0] as any).id;
      console.log("✅ Clínica existente encontrada:", clinicId);

      // Verificar si el slug ya está en uso por OTRA clínica
      if ((existing.rows[0] as any).slug !== slug) {
        const slugCheck = await query(
          "SELECT id FROM clinics WHERE slug = ? AND id != ?",
          [slug, clinicId]
        );
        if (slugCheck.rows && slugCheck.rows.length > 0) {
          return NextResponse.json({ 
            message: `El slug "${slug}" ya está en uso. Elige otro.` 
          }, { status: 400 });
        }
      }

      await query(
        `UPDATE clinics 
         SET name = ?, slug = ?, owner_name = ?, phone = ?, 
             address = ?, city = ?, country = ?, logo_url = ?, 
             business_image_url = ?, specialty = ?, status = 'pending',
             updated_at = datetime('now')
         WHERE id = ?`,
        [
          name, slug, ownerName, phone || '', 
          address || '', city || '', country || 'Colombia', 
          logoUrl || '', businessImageUrl || '', specialty || '',
          clinicId
        ]
      );
      console.log("✅ Clínica actualizada correctamente");
    } else {
      // No existe, crear nueva
      clinicId = crypto.randomUUID();
      console.log("🆕 Creando nueva clínica:", clinicId);

      await query(
        `INSERT INTO clinics (id, name, slug, owner_name, email, password, specialty, status, logo_url, business_image_url, phone, address, city, country, approved, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, '', ?, 'pending', ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
        [
          clinicId, name, slug, ownerName, email, specialty || '',
          logoUrl || '', businessImageUrl || '', phone || '', address || '', city || '', country || 'Colombia'
        ]
      );
      console.log("✅ Nueva clínica creada correctamente");
    }

    return NextResponse.json({ 
      message: "Clínica creada exitosamente. Pendiente de aprobación.",
      clinicId,
      slug,
      storeUrl: `/tienda/${slug}`
    });
    
  } catch (error: any) {
    console.error("❌ Error completo:", error);
    return NextResponse.json({ 
      message: "Error al crear clínica",
      error: error.message
    }, { status: 500 });
  }
}