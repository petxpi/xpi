import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");
    if (!token) return null;
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (petId) {
      // MODO PÚBLICO: Obtener info de la mascota y contacto del dueño (sin requerir login)
      const result = await db.execute(
        `SELECT p.name as pet_name, p.status as pet_status, p.photo_url,
                u.name as owner_name, u.email as owner_email, 
                u.phone, u.whatsapp, u.show_phone, u.show_whatsapp, u.show_email
         FROM pets p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ? OR p.public_id = ?`,
        [petId, petId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
      }

      const row = result.rows[0] as any;
      return NextResponse.json({
        petName: row.pet_name,
        petStatus: row.pet_status,
        petPhotoUrl: row.photo_url,
        ownerName: row.owner_name,
        ownerEmail: row.owner_email,
        ownerPhone: row.phone,
        ownerWhatsApp: row.whatsapp,
        showPhone: row.show_phone === 1,
        showWhatsApp: row.show_whatsapp === 1,
        showEmail: row.show_email === 1,
      });
    }

    // MODO PRIVADO: Obtener configuración del usuario logueado (para el dashboard)
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const result = await db.execute(
      `SELECT phone, whatsapp, show_phone, show_whatsapp, show_email
       FROM users WHERE id = ?`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        phone: "", whatsapp: "", show_phone: false, show_whatsapp: false, show_email: true,
      });
    }

    const row = result.rows[0] as any;
    return NextResponse.json({
      phone: row.phone || "",
      whatsapp: row.whatsapp || "",
      show_phone: row.show_phone === 1,
      show_whatsapp: row.show_whatsapp === 1,
      show_email: row.show_email === 1,
    });

  } catch (error: any) {
    console.error("❌ Error en GET /api/pet-contact:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, whatsapp, show_phone, show_whatsapp, show_email } = body;

    await db.execute(
      `UPDATE users 
       SET phone = ?, whatsapp = ?, show_phone = ?, show_whatsapp = ?, show_email = ?
       WHERE id = ?`,
      [
        phone || null,
        whatsapp || null,
        show_phone ? 1 : 0,
        show_whatsapp ? 1 : 0,
        show_email ? 1 : 0,
        userId,
      ]
    );

    return NextResponse.json({ message: "✅ Configuración guardada exitosamente" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error al guardar configuración:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}