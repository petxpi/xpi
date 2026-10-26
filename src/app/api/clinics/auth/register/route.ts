import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clinicName, ownerName, email, password, specialty } = body;

    if (!clinicName || !ownerName || !email || !password) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await query("SELECT id FROM clinics WHERE email = ?", [email]);
    if (existing.rows && existing.rows.length > 0) {
      return NextResponse.json(
        { message: "Ya existe una clínica con este email" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const clinicId = crypto.randomUUID();

    // Crear clínica
    await query(
      `INSERT INTO clinics (id, name, owner_name, email, password, specialty, approved) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [clinicId, clinicName, ownerName, email, hashedPassword, specialty || "General"]
    );

    return NextResponse.json(
      { message: "Clínica registrada. Esperando aprobación del administrador." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro de clínica:", error);
    return NextResponse.json(
      { message: "Error al registrar clínica" },
      { status: 500 }
    );
  }
}