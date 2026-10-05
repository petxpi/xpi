import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function GET(request: Request) {
  try {
    // Obtener el token de la cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const token = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar el token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.json(
        { message: "Token inválido" },
        { status: 401 }
      );
    }

    // Buscar usuario en la base de datos
    const result = await db.execute(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = result.rows[0] as any;

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}