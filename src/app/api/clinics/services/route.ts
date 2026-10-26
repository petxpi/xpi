import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ message: "ID de clínica requerido" }, { status: 400 });
    }

    const result = await query(
      "SELECT * FROM clinic_services WHERE clinic_id = ? ORDER BY name ASC",
      [clinicId]
    );

    return NextResponse.json({ services: result.rows || [] });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json({ message: "Error al obtener servicios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clinicId, name, description, price, duration, category, specialty, schedule, employeeIds, bookableOnline } = body;

    if (!clinicId || !name || !price || !duration) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const serviceId = crypto.randomUUID();

    await query(
      `INSERT INTO clinic_services (id, clinic_id, name, description, price, duration_minutes, active, category, specialty, schedule, employee_ids, bookable_online) 
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
      [
        serviceId, clinicId, name, description || "", 
        parseFloat(price), parseInt(duration),
        category || "", specialty || "",
        JSON.stringify(schedule || []),
        JSON.stringify(employeeIds || []),
        bookableOnline ? 1 : 0
      ]
    );

    return NextResponse.json({ message: "Servicio creado exitosamente", serviceId }, { status: 201 });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return NextResponse.json({ message: "Error al crear servicio" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, price, duration, active, category, specialty, schedule, employeeIds, bookableOnline } = body;

    if (!id) {
      return NextResponse.json({ message: "ID de servicio requerido" }, { status: 400 });
    }

    await query(
      `UPDATE clinic_services 
       SET name = ?, description = ?, price = ?, duration_minutes = ?, active = ?, 
           category = ?, specialty = ?, schedule = ?, employee_ids = ?, bookable_online = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      [
        name, description || "", parseFloat(price), parseInt(duration),
        active !== undefined ? (active ? 1 : 0) : 1,
        category || "", specialty || "",
        JSON.stringify(schedule || []),
        JSON.stringify(employeeIds || []),
        bookableOnline ? 1 : 0,
        id
      ]
    );

    return NextResponse.json({ message: "Servicio actualizado" });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    return NextResponse.json({ message: "Error al actualizar servicio" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID de servicio requerido" }, { status: 400 });
    }

    await query("DELETE FROM clinic_services WHERE id = ?", [id]);

    return NextResponse.json({ message: "Servicio eliminado" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return NextResponse.json({ message: "Error al eliminar servicio" }, { status: 500 });
  }
}