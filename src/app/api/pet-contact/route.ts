import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return NextResponse.json(
        { message: "Falta el ID de la mascota" },
        { status: 400 }
      );
    }

    // Obtener información de contacto del dueño
    const result = await db.execute(
      `SELECT u.name, u.email, u.phone, u.whatsapp, 
              u.show_phone, u.show_whatsapp, u.show_email,
              p.name as pet_name, p.status as pet_status
       FROM pets p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [petId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Mascota no encontrada" },
        { status: 404 }
      );
    }

    const contact = result.rows[0] as any;

    return NextResponse.json(
      {
        ownerName: contact.name,
        ownerEmail: contact.email,
        ownerPhone: contact.phone,
        ownerWhatsApp: contact.whatsapp,
        showPhone: contact.show_phone === 1,
        showWhatsApp: contact.show_whatsapp === 1,
        showEmail: contact.show_email === 1,
        petName: contact.pet_name,
        petStatus: contact.pet_status
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener contacto:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}