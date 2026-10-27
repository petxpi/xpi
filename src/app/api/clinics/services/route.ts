import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    const result = await query(
      "SELECT * FROM clinic_services WHERE clinic_id = ? ORDER BY created_at DESC",
      [clinicId]
    );

    return NextResponse.json({ services: result.rows || [] });
  } catch (error: any) {
    console.error("Error GET servicios:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Datos recibidos:", body);

    const { clinicId, name, description, price, duration, category, specialty, schedule, bookableOnline } = body;

    if (!clinicId || !name || !price || !duration) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Verificar que la clínica existe
    const clinicCheck = await query("SELECT id FROM clinics WHERE id = ?", [clinicId]);
    if (!clinicCheck.rows || clinicCheck.rows.length === 0) {
      return NextResponse.json({ message: "La clínica no existe en la base de datos" }, { status: 400 });
    }

    await query(
      `INSERT INTO clinic_services 
       (id, clinic_id, name, description, price, duration_minutes, category, specialty, schedule, bookable_online, active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        clinicId,
        name,
        description || '',
        parseFloat(price),
        parseInt(duration),
        category || '',
        specialty || '',
        JSON.stringify(schedule || []),
        bookableOnline ? 1 : 0,
        now,
        now
      ]
    );

    console.log("✅ Servicio creado:", id);

    return NextResponse.json({ 
      message: "Servicio creado exitosamente",
      serviceId: id
    });
  } catch (error: any) {
    console.error("❌ Error al crear servicio:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, active, name, description, price, duration, category, specialty, schedule, bookableOnline } = body;

    if (!id) {
      return NextResponse.json({ message: "Falta el ID del servicio" }, { status: 400 });
    }

    const now = new Date().toISOString();

    await query(
      `UPDATE clinic_services 
       SET name = ?, description = ?, price = ?, duration_minutes = ?, 
           category = ?, specialty = ?, schedule = ?, bookable_online = ?, 
           active = ?, updated_at = ?
       WHERE id = ?`,
      [
        name,
        description || '',
        parseFloat(price),
        parseInt(duration),
        category || '',
        specialty || '',
        JSON.stringify(schedule || []),
        bookableOnline ? 1 : 0,
        active !== undefined ? active : 1,
        now,
        id
      ]
    );

    return NextResponse.json({ message: "Servicio actualizado exitosamente" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Falta el ID del servicio" }, { status: 400 });
    }

    await query("DELETE FROM clinic_services WHERE id = ?", [id]);

    return NextResponse.json({ message: "Servicio eliminado exitosamente" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}