import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { petId, name, severity, notes } = body;

    if (!petId || !name) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO clinic_allergies (id, pet_id, name, severity, notes, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, name, severity || 'Leve', notes || '']
    );

    return NextResponse.json({ success: true, message: "Alergia registrada" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "Falta el ID" }, { status: 400 });
    }

    await query(`DELETE FROM clinic_allergies WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: "Alergia eliminada" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}