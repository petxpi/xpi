import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan credenciales" }, { status: 400 });
    }

    // Buscar admin en la base de datos
    const result: any = await query("SELECT * FROM admins WHERE email = ?", [email]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const admin = result.rows[0];

    // Verificar que esté activo
    if (admin.active !== 1) {
      return NextResponse.json({ message: "Cuenta desactivada" }, { status: 403 });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    // Generar JWT token
    const token = await new SignJWT({
      userId: admin.id,
      email: admin.email,
      type: "admin",
      role: admin.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    // Setear cookie de autenticación
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error: any) {
    console.error("Error en login admin:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}