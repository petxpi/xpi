import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Obtener citas
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
    console.error("Error GET appointments:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Crear nueva cita
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clinicId, 
      petId, 
      petName, 
      clientName, 
      clientPhone, 
      clientEmail, 
      serviceId, 
      serviceName,
      appointmentDate, 
      appointmentTime, 
      status, 
      notes 
    } = body;

    if (!clinicId || !appointmentDate) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan datos obligatorios (clinicId y appointmentDate)" 
      }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO clinic_appointments 
       (id, clinic_id, pet_id, pet_name, client_name, client_phone, client_email, 
        service_id, appointment_date, appointment_time, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        clinicId,
        petId || null,
        petName || '',
        clientName || '',
        clientPhone || '',
        clientEmail || '',
        serviceId || null,
        appointmentDate,
        appointmentTime || '',
        status || 'pending',
        notes || ''
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Cita creada correctamente",
      appointmentId: id
    });

  } catch (error: any) {
    console.error("Error POST appointments:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error al crear la cita: " + error.message 
    }, { status: 500 });
  }
}

// PUT - Actualizar cita
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, clinicId, diagnosis, vetName, vetId, petId, status } = body;

    if (!id || !clinicId) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan datos" 
      }, { status: 400 });
    }

    await query(
      `UPDATE clinic_appointments 
       SET diagnosis = ?, vet_name = ?, vet_id = ?, pet_id = ?, status = ?, updated_at = datetime('now')
       WHERE id = ? AND clinic_id = ?`,
      [diagnosis || '', vetName || '', vetId || '', petId || '', status || '', id, clinicId]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Cita actualizada" 
    });

  } catch (error: any) {
    console.error("Error PUT appointments:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}