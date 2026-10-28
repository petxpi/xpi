import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendAppointmentEmail } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    let sql = `
      SELECT a.*, s.name as service_name, s.duration_minutes, s.price
      FROM appointments a
      JOIN clinic_services s ON a.service_id = s.id
      WHERE a.clinic_id = ?
    `;
    const queryParams: any[] = [clinicId];

    if (date) {
      sql += " AND a.appointment_date = ?";
      queryParams.push(date);
    }

    if (status) {
      sql += " AND a.status = ?";
      queryParams.push(status);
    }

    sql += " ORDER BY a.appointment_date DESC, a.appointment_time ASC";

    const result = await query(sql, queryParams);

    return NextResponse.json({ 
      success: true, 
      appointments: result.rows || [] 
    });

  } catch (error: any) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clinicId, serviceId, clientName, clientPhone, clientEmail, 
      petName, appointmentDate, appointmentTime, notes 
    } = body;

    console.log("📥 Datos recibidos para crear cita:", { clinicId, serviceId });

    if (!clinicId || !serviceId || !clientName || !clientPhone || !petName || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const clinicResult = await query("SELECT name FROM clinics WHERE id = ?", [clinicId]);
    const serviceResult = await query("SELECT name FROM clinic_services WHERE id = ?", [serviceId]);

    const clinicName = (clinicResult.rows as any[])?.[0]?.name || "la clínica";
    const serviceName = (serviceResult.rows as any[])?.[0]?.name || "el servicio";

    const serviceCheck = await query(
      "SELECT id, name, duration_minutes FROM clinic_services WHERE id = ? AND active = 1",
      [serviceId]
    );

    if (!serviceCheck.rows || serviceCheck.rows.length === 0) {
      return NextResponse.json({ message: "El servicio no existe o no está activo" }, { status: 400 });
    }

    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE clinic_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [clinicId, appointmentDate, appointmentTime]
    );

    if (conflictCheck.rows && conflictCheck.rows.length > 0) {
      return NextResponse.json({ message: "Ese horario ya está reservado." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    
    await query(
      `INSERT INTO appointments 
       (id, clinic_id, service_id, client_name, client_phone, client_email, pet_name, 
        appointment_date, appointment_time, status, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))`,
      [id, clinicId, serviceId, clientName, clientPhone, clientEmail || '', petName,
       appointmentDate, appointmentTime, notes || '']
    );

    console.log("✅ Cita creada:", id);

    // 📧 Enviar email
    if (clientEmail) {
      try {
        await sendAppointmentEmail({
          to: clientEmail,
          clinicName, clientName, petName, serviceName,
          appointmentDate, appointmentTime,
          notes: notes || ""
        }, "created");
        console.log("📧 Email enviado a:", clientEmail);
      } catch (emailError) {
        console.error("⚠️ Error enviando email (la cita se creó igual):", emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cita reservada exitosamente",
      appointmentId: id 
    });

  } catch (error: any) {
    console.error("❌ Error al crear cita:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Estado no válido" }, { status: 400 });
    }

    const appointmentResult = await query(
      `SELECT a.*, c.name as clinic_name, s.name as service_name 
       FROM appointments a
       JOIN clinics c ON a.clinic_id = c.id
       JOIN clinic_services s ON a.service_id = s.id
       WHERE a.id = ?`,
      [id]
    );

    const appointment = (appointmentResult.rows as any[])?.[0];

    await query(
      `UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, id]
    );

    console.log("✅ Estado actualizado:", id, "→", status);

    // 📧 Enviar email según el estado
    if (appointment && appointment.client_email) {
      try {
        const emailType = status === 'cancelled' ? 'cancelled' : 'updated';
        await sendAppointmentEmail({
          to: appointment.client_email,
          clinicName: appointment.clinic_name,
          clientName: appointment.client_name,
          petName: appointment.pet_name,
          serviceName: appointment.service_name,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          notes: appointment.notes || "",
          status: status
        }, emailType);
        console.log(`📧 Email de ${status} enviado a:`, appointment.client_email);
      } catch (emailError) {
        console.error("⚠️ Error enviando email:", emailError);
      }
    }

    return NextResponse.json({ success: true, message: "Estado actualizado" });

  } catch (error: any) {
    console.error("Error al actualizar cita:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}