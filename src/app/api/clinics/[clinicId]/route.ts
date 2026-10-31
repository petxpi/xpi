import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Obtener datos de la clínica
export async function GET(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params;
    const result: any = await query(
      `SELECT * FROM clinics WHERE id = ?`,
      [clinicId]
    );
    const clinic = (result.rows as any[])?.[0];
    if (!clinic) {
      return NextResponse.json({ message: "Clínica no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true, clinic });
  } catch (error: any) {
    console.error("Error GET clinic:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

// PUT - Actualizar datos de la clínica (solo columnas existentes y enviadas)
export async function PUT(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params;
    const body = await request.json();

    console.log("=== BODY PUT clinic ===", body);

    // 1. Obtener columnas existentes de la tabla
    const schemaResult: any = await query(`PRAGMA table_info(clinics)`);
    const existingColumns = (schemaResult.rows as any[]).map((row: any) => row.name);

    console.log("=== Columnas existentes ===", existingColumns);

    // 2. Construir UPDATE dinámicamente
    const updates: string[] = [];
    const values: any[] = [];

    // Campos que el frontend puede enviar
    const allowedFields = [
      "name", "email", "phone", "address", "city", "country", "description",
      "logo_url", "banner_url",
      "monday_open", "monday_close",
      "tuesday_open", "tuesday_close",
      "wednesday_open", "wednesday_close",
      "thursday_open", "thursday_close",
      "friday_open", "friday_close",
      "saturday_open", "saturday_close",
      "sunday_closed",
      "appointment_duration", "appointment_margin",
      "primary_color", "secondary_color",
      "currency", "tax_rate",
      "email_notifications", "sms_notifications", "reminder_hours"
    ];

    allowedFields.forEach(field => {
      // Solo si la columna existe Y el valor fue enviado (no undefined/null)
      if (existingColumns.includes(field) && body[field] !== undefined && body[field] !== null) {
        updates.push(`${field} = ?`);
        // Convertir booleanos a 0/1 para SQLite
        if (typeof body[field] === "boolean") {
          values.push(body[field] ? 1 : 0);
        } else {
          values.push(body[field]);
        }
      }
    });

    // Si no hay nada que actualizar
    if (updates.length === 0) {
      return NextResponse.json({ success: true, message: "No hay cambios que guardar" });
    }

    // Agregar updated_at
    if (existingColumns.includes("updated_at")) {
      updates.push("updated_at = datetime('now')");
    }

    values.push(clinicId);

    const sql = `UPDATE clinics SET ${updates.join(", ")} WHERE id = ?`;

    console.log("=== SQL ===", sql);
    console.log("=== VALUES ===", values);

    await query(sql, values);

    console.log("=== Clínica actualizada ===", clinicId);

    return NextResponse.json({ success: true, message: "Configuración guardada" });
  } catch (error: any) {
    console.error("Error PUT clinic:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}