// POST - Crear nueva cita
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=== BODY RECIBIDO EN POST ===", body); // <-- Esto nos dirá exactamente qué llega

    const { 
      clinicId, 
      petId, 
      serviceId, 
      appointmentDate, 
      appointmentTime,
      status
    } = body;

    if (!clinicId || !appointmentDate) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan datos obligatorios (clinicId y appointmentDate)" 
      }, { status: 400 });
    }

    // Validación estricta: patient_id es NOT NULL en la BD
    if (!petId || petId === "") {
      return NextResponse.json({
        success: false,
        message: "Debes seleccionar una mascota válida"
      }, { status: 400 });
    }

    const id = crypto.randomUUID();

    // Combinar fecha y hora si existe appointmentTime
    const fullDateTime = appointmentTime 
      ? `${appointmentDate} ${appointmentTime}` 
      : appointmentDate;

    // INSERT usando las columnas reales de la tabla
    // patient_id recibe petId directamente (sin "|| null" para evitar el error NOT NULL)
    await query(
      `INSERT INTO clinic_appointments 
       (id, clinic_id, patient_id, service_id, appointment_date, status, pet_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        clinicId,
        petId, 
        serviceId || null,
        fullDateTime,
        status || 'pending',
        petId
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