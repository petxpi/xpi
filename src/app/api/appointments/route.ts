// PUT - Actualizar cita (solo status)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, clinicId, status } = body;

    if (!id || !clinicId) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan datos" 
      }, { status: 400 });
    }

    // Solo actualizamos el status, no tocamos las foreign keys
    await query(
      `UPDATE clinic_appointments 
       SET status = ?
       WHERE id = ? AND clinic_id = ?`,
      [status, id, clinicId]
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