import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Verificar si ya existe
    const existing: any = await query("SELECT id FROM clinics WHERE email = ?", [email]);
    if (existing.rows && existing.rows.length > 0) {
      return NextResponse.json(
        { message: "Ya existe una clínica con este email" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO clinics (id, name, email, phone, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
      [id, name, email, phone || '']
    );

    return NextResponse.json({
      success: true,
      clinic: {
        id,
        name,
        email,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error("Error en registro:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}