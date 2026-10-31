import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Falta el email" }, { status: 400 });
    }

    const result: any = await query("SELECT * FROM clinics WHERE email = ?", [email]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const clinic = result.rows[0];

    // Verificar que la clínica está activa
    if (clinic.status !== "active") {
      return NextResponse.json({ 
        message: "Tu clínica aún no ha sido aprobada por el administrador. Estado: " + clinic.status 
      }, { status: 403 });
    }

    // Generar JWT token con el ID de la clínica
    const token = await new SignJWT({ 
      userId: clinic.id,  // Usamos clinic.id como userId
      email: clinic.email,
      type: "clinic"  // Para diferenciar de usuarios comunes
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        status: clinic.status
      },
      redirect: `/clinica/id/${clinic.id}`  // Redirección a página pública
    });

    // Setear cookie de autenticación
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,  // 7 días
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error: any) {
    console.error("Error en login:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}