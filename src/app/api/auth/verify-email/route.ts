import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=token_faltante", request.url));
    }

    // Buscar usuario con ese token
    const result = await db.execute(
      "SELECT id, email_verified FROM users WHERE verification_token = ?",
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.redirect(new URL("/login?error=token_invalido", request.url));
    }

    const user = result.rows[0] as any;

    if (user.email_verified === 1) {
      return NextResponse.redirect(new URL("/login?success=ya_verificado", request.url));
    }

    // Activar la cuenta y borrar el token
    await db.execute(
      "UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    console.log("✅ Correo verificado exitosamente para el usuario:", user.id);

    // Redirigir al login con mensaje de éxito
    return NextResponse.redirect(new URL("/login?success=verificacion_exitosa", request.url));
  } catch (error) {
    console.error("❌ Error al verificar email:", error);
    return NextResponse.redirect(new URL("/login?error=error_servidor", request.url));
  }
}