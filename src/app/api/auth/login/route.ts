import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(" Intentando login:", email);

    const result = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    if (result.rows.length === 0) {
      console.log(" Usuario no encontrado");
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = result.rows[0] as any;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Contraseña incorrecta");
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    console.log("✅ Login exitoso:", user.email);

    const response = NextResponse.json(
      {
        message: "Login exitoso",
        user: { id: user.id, name: user.name, email: user.email }
      },
      { status: 200 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Error en login:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}