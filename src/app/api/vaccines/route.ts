import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { petId, name, dateApplied, nextDueDate, notes } = body;

    if (!petId || !name || !dateApplied) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO clinic_vaccines (id, pet_id, name, date_applied, next_due_date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, name, dateApplied, nextDueDate || '', notes || '']
    );

    return NextResponse.json({ success: true, message: "Vacuna registrada" });
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

    await query(`DELETE FROM clinic_vaccines WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: "Vacuna eliminada" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}