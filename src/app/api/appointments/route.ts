import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const petId = searchParams.get("petId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    if (petId) {
      const result: any = await query(
        `SELECT * FROM clinic_appointments 
         WHERE clinic_id = ? AND pet_id = ?
         ORDER BY appointment_date DESC`,
        [clinicId, petId]
      );
      return NextResponse.json({ 
        success: true, 
        appointments: result.rows || [] 
      });
    }

    const result: any = await query(
      `SELECT * FROM clinic_appointments 
       WHERE clinic_id = ?
       ORDER BY appointment_date DESC`,
      [clinicId]
    );

    return NextResponse.json({ 
      success: true, 
      appointments: result.rows || [] 
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, clinicId, diagnosis, vetName, vetId, petId, status } = body;

    if (!id || !clinicId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    await query(
      `UPDATE clinic_appointments 
       SET diagnosis = ?, vet_name = ?, vet_id = ?, pet_id = ?, status = ?, updated_at = datetime('now')
       WHERE id = ? AND clinic_id = ?`,
      [diagnosis || '', vetName || '', vetId || '', petId || '', status || '', id, clinicId]
    );

    return NextResponse.json({ success: true, message: "Cita actualizada" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}