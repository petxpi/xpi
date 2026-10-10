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
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener datos de contacto del usuario
    const result = await db.execute(
      `SELECT phone, whatsapp, show_phone, show_whatsapp, show_email, email
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        phone: "",
        whatsapp: "",
        show_phone: false,
        show_whatsapp: false,
        show_email: true,
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
    console.error("❌ Error al obtener contacto:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, whatsapp, show_phone, show_whatsapp, show_email } = body;

    await db.execute(
      `UPDATE users 
       SET phone = ?, whatsapp = ?, 
           show_phone = ?, show_whatsapp = ?, show_email = ?
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

    return NextResponse.json(
      { message: "✅ Configuración guardada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al guardar configuración:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}