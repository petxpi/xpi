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
    console.error("Error al obtener clínica:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

// PUT - Actualizar datos de la clínica
export async function PUT(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params;
    const body = await request.json();

    console.log("=== BODY PUT clinic ===", body);

    const {
      name, email, phone, address, city, country, description,
      logo_url, banner_url,
      monday_open, monday_close,
      tuesday_open, tuesday_close,
      wednesday_open, wednesday_close,
      thursday_open, thursday_close,
      friday_open, friday_close,
      saturday_open, saturday_close,
      sunday_closed,
      appointment_duration, appointment_margin,
      primary_color, secondary_color,
      currency, tax_rate,
      email_notifications, sms_notifications, reminder_hours
    } = body;

    await query(
      `UPDATE clinics SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        country = COALESCE(?, country),
        description = COALESCE(?, description),
        logo_url = COALESCE(?, logo_url),
        banner_url = COALESCE(?, banner_url),
        monday_open = COALESCE(?, monday_open),
        monday_close = COALESCE(?, monday_close),
        tuesday_open = COALESCE(?, tuesday_open),
        tuesday_close = COALESCE(?, tuesday_close),
        wednesday_open = COALESCE(?, wednesday_open),
        wednesday_close = COALESCE(?, wednesday_close),
        thursday_open = COALESCE(?, thursday_open),
        thursday_close = COALESCE(?, thursday_close),
        friday_open = COALESCE(?, friday_open),
        friday_close = COALESCE(?, friday_close),
        saturday_open = COALESCE(?, saturday_open),
        saturday_close = COALESCE(?, saturday_close),
        sunday_closed = COALESCE(?, sunday_closed),
        appointment_duration = COALESCE(?, appointment_duration),
        appointment_margin = COALESCE(?, appointment_margin),
        primary_color = COALESCE(?, primary_color),
        secondary_color = COALESCE(?, secondary_color),
        currency = COALESCE(?, currency),
        tax_rate = COALESCE(?, tax_rate),
        email_notifications = COALESCE(?, email_notifications),
        sms_notifications = COALESCE(?, sms_notifications),
        reminder_hours = COALESCE(?, reminder_hours),
        updated_at = datetime('now')
       WHERE id = ?`,
      [
        name, email, phone, address, city, country, description,
        logo_url, banner_url,
        monday_open, monday_close,
        tuesday_open, tuesday_close,
        wednesday_open, wednesday_close,
        thursday_open, thursday_close,
        friday_open, friday_close,
        saturday_open, saturday_close,
        sunday_closed,
        appointment_duration, appointment_margin,
        primary_color, secondary_color,
        currency, tax_rate,
        email_notifications, sms_notifications, reminder_hours,
        clinicId
      ]
    );

    console.log("=== Clínica actualizada ===", clinicId);

    return NextResponse.json({ success: true, message: "Configuración guardada" });
  } catch (error: any) {
    console.error("Error al actualizar clínica:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}