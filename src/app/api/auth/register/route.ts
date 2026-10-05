import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log("📝 Intentando registrar:", { name, email });

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nombre, correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const existingUser = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "El correo ya está registrado. Por favor usa otro o inicia sesión." },
        { status: 400 }
      );
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar usuario con email_verified = 1 (ya verificado automáticamente)
    await db.execute(
      `INSERT INTO users (id, name, email, password, email_verified, created_at)
       VALUES (?, ?, ?, ?, 1, datetime('now'))`,
      [userId, name, email, passwordHash]
    );

    console.log("✅ Usuario creado exitosamente:", userId);

    return NextResponse.json(
      { message: "Usuario creado exitosamente" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en registro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}