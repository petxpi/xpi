import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const staffId = searchParams.get("staffId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    if (staffId) {
      const result = await query(
        `SELECT * FROM clinic_staff WHERE id = ? AND clinic_id = ?`,
        [staffId, clinicId]
      );
      const staff = (result.rows as any[])?.[0];
      if (!staff) {
        return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ success: true, staff });
    }

    const result = await query(
      `SELECT * FROM clinic_staff WHERE clinic_id = ? ORDER BY created_at DESC`,
      [clinicId]
    );

    return NextResponse.json({ success: true, staff: result.rows || [] });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clinicId, name, role, email, phone, specialty, photoUrl, professionalCard, cvUrl } = body;

    if (!clinicId || !name || !role) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO clinic_staff (id, clinic_id, name, role, email, phone, specialty, photo_url, professional_card, cv_url, active, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', datetime('now'), datetime('now'))`,
      [id, clinicId, name, role, email || '', phone || '', specialty || '', photoUrl || '', professionalCard || '', cvUrl || '']
    );

    return NextResponse.json({ success: true, staffId: id });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { staffId, clinicId, name, role, email, phone, specialty, photoUrl, professionalCard, cvUrl } = body;

    if (!staffId || !clinicId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    await query(
      `UPDATE clinic_staff SET name = ?, role = ?, email = ?, phone = ?, specialty = ?, photo_url = ?, professional_card = ?, cv_url = ?, updated_at = datetime('now') WHERE id = ? AND clinic_id = ?`,
      [name, role, email || '', phone || '', specialty || '', photoUrl || '', professionalCard || '', cvUrl || '', staffId, clinicId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}