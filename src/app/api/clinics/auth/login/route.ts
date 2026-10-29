import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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
      return NextResponse.json({ message: "Clínica inactiva" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        status: clinic.status
      }
    });

  } catch (error: any) {
    console.error("Error en login:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}