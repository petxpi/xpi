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

    console.log("🔐 Intentando login con email:", email);
    console.log("📊 Variables de entorno:");
    console.log("  TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "✅ Configurada" : "❌ FALTA");
    console.log("  TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "✅ Configurada" : "❌ FALTA");
    console.log("  BETTER_AUTH_SECRET:", process.env.BETTER_AUTH_SECRET ? "✅ Configurada" : "❌ FALTA");

    // Verificar que la conexión a la base de datos funcione
    console.log("🔌 Probando conexión a la base de datos...");
    const testQuery = await db.execute("SELECT 1 as test");
    console.log("✅ Conexión a BD exitosa:", testQuery);

    console.log("🔍 Buscando usuario en la base de datos...");
    const result = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    console.log(" Resultado de la consulta:", result.rows.length, "filas encontradas");

    if (result.rows.length === 0) {
      console.log(" Usuario no encontrado con email:", email);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = result.rows[0] as any;
    console.log("✅ Usuario encontrado:", user.email);

    console.log("🔑 Verificando contraseña...");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Contraseña incorrecta para:", user.email);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    console.log("✅ Contraseña válida, generando token...");

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    console.log("✅ Token generado exitosamente");

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

    console.log("✅ Login completado exitosamente para:", user.email);

    return response;
  } catch (error: any) {
    console.error("❌ ERROR EN LOGIN:", error);
    console.error("❌ Mensaje de error:", error.message);
    console.error("❌ Stack trace:", error.stack);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}