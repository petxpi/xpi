import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    const result: any = await query(
      `SELECT a.*, p.name as pet_name, s.name as service_name
       FROM clinic_appointments a
       LEFT JOIN clinic_patients p ON a.patient_id = p.id
       LEFT JOIN clinic_services s ON a.service_id = s.id
       WHERE a.clinic_id = ?
       ORDER BY a.appointment_date DESC`,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=== BODY POST appointments ===", body);

    const { 
      clinicId, 
      petId, 
      patientId,
      serviceId, 
      appointmentDate, 
      appointmentTime,
      status,
      notes,
      // Datos de mascota nueva
      newPetName,
      newPetSpecies,
      newPetBreed,
      newOwnerName,
      newOwnerPhone,
      newOwnerEmail
    } = body;

    if (!clinicId || !appointmentDate) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan datos obligatorios" 
      }, { status: 400 });
    }

    let finalPetId = petId || patientId;

    // Si es mascota nueva, crearla primero
    if (!finalPetId && newPetName) {
      const newPetId = crypto.randomUUID();
      await query(
        `INSERT INTO clinic_patients 
         (id, clinic_id, name, species, breed, owner_name, owner_phone, owner_email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newPetId,
          clinicId,
          newPetName,
          newPetSpecies || 'Perro',
          newPetBreed || '',
          newOwnerName || '',
          newOwnerPhone || '',
          newOwnerEmail || ''
        ]
      );
      finalPetId = newPetId;
      console.log("Mascota nueva creada:", newPetId);
    }

    if (!finalPetId) {
      return NextResponse.json({
        success: false,
        message: "Debes seleccionar o crear una mascota"
      }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const fullDateTime = appointmentTime 
      ? `${appointmentDate} ${appointmentTime}` 
      : appointmentDate;

    await query(
      `INSERT INTO clinic_appointments 
       (id, clinic_id, patient_id, service_id, appointment_date, status, pet_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        clinicId,
        finalPetId,
        serviceId || null,
        fullDateTime,
        status || 'scheduled',
        finalPetId
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Cita creada correctamente",
      appointmentId: id
    });

  } catch (error: any) {
    console.error("=== ERROR POST appointments ===", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error al crear la cita: " + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, clinicId, diagnosis, vetName, vetId, patientId, status } = body;

    if (!id || !clinicId) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan datos" 
      }, { status: 400 });
    }

    await query(
      `UPDATE clinic_appointments 
       SET diagnosis = ?, vet_name = ?, vet_id = ?, patient_id = ?, status = ?
       WHERE id = ? AND clinic_id = ?`,
      [diagnosis || '', vetName || '', vetId || '', patientId || '', status || '', id, clinicId]
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