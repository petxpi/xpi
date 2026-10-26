import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clinicId, name, ownerName, email, phone, 
      address, city, country, logoUrl, businessImageUrl, specialty 
    } = body;

    if (!clinicId || !name || !ownerName || !email) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    await query(
      `UPDATE clinics 
       SET name = ?, owner_name = ?, email = ?, phone = ?, 
           address = ?, city = ?, country = ?, logo_url = ?, 
           business_image_url = ?, specialty = ?, status = 'pending',
           updated_at = datetime('now')
       WHERE id = ?`,
      [name, ownerName, email, phone || '', address || '', city || '', country || 'Colombia', logoUrl || '', businessImageUrl || '', specialty || '', clinicId]
    );

    return NextResponse.json({ 
      message: "Clínica creada exitosamente. Pendiente de aprobación.",
      clinicId 
    });
  } catch (error) {
    console.error("Error al crear clínica:", error);
    return NextResponse.json({ message: "Error al crear clínica" }, { status: 500 });
  }
}