import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar si ya existe
    const existing = await query("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing.rows && existing.rows.length > 0) {
      return NextResponse.json({ message: "Ya existe un admin con ese email" }, { status: 400 });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    await query(
      `INSERT INTO admins (id, name, email, password, role, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'super_admin', 1, datetime('now'), datetime('now'))`,
      [id, name, email, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: "Admin creado exitosamente",
      admin: { id, name, email, role: "super_admin" }
    });

  } catch (error: any) {
    console.error("Error creando admin:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}