import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // ← ESTO CONECTA CON TURSO

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, ownerName, email, phone, address, city, country, logoUrl, businessImageUrl, specialty } = body;

    console.log("📥 Datos recibidos para crear clínica:", { name, slug, email });

    if (!name || !slug || !ownerName || !email) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 1. Verificar que el slug no esté en uso en TURSO
    const slugCheck = await query("SELECT id FROM clinics WHERE slug = ?", [slug]);
    if (slugCheck.rows && slugCheck.rows.length > 0) {
      return NextResponse.json({ message: "El nombre de la tienda (slug) ya está en uso" }, { status: 400 });
    }

    // 2. Buscar clínica existente por email en TURSO
    const existing = await query("SELECT id FROM clinics WHERE email = ?", [email]);

    if (existing.rows && existing.rows.length > 0) {
      // Actualizar clínica existente
      const id = (existing.rows[0] as any).id;
      await query(
        `UPDATE clinics 
         SET name = ?, slug = ?, owner_name = ?, phone = ?, address = ?, 
             city = ?, country = ?, logo_url = ?, business_image_url = ?, 
             specialty = ?, status = 'pending', updated_at = datetime('now') 
         WHERE id = ?`,
        [name, slug, ownerName, phone || '', address || '', city || '', country || 'Colombia', logoUrl || '', businessImageUrl || '', specialty || '', id]
      );
      console.log("✅ Clínica actualizada en Turso:", id);
      return NextResponse.json({ ok: true, clinicId: id, slug });
    } else {
      // Crear nueva clínica en TURSO
      const id = crypto.randomUUID();
      await query(
        `INSERT INTO clinics 
         (id, name, slug, owner_name, email, password, specialty, status, 
          logo_url, business_image_url, phone, address, city, country, approved, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, '', ?, 'pending', ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
        [id, name, slug, ownerName, email, specialty || '', logoUrl || '', businessImageUrl || '', phone || '', address || '', city || '', country || 'Colombia']
      );
      console.log("✅ Clínica creada en Turso:", id);
      return NextResponse.json({ ok: true, clinicId: id, slug });
    }
  } catch (error: any) {
    console.error("❌ Error al crear clínica en Turso:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}