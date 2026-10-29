import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function getColombiaDate(): string {
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  return colombiaTime.toISOString().split("T")[0];
}

export async function GET(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params;
    const today = getColombiaDate();

    console.log("Fecha en Colombia:", today);

    // 1. Total de citas de HOY (Colombia)
    const todayAppointments: any = await query(
      `SELECT COUNT(*) as total FROM clinic_appointments
       WHERE clinic_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [clinicId, today]
    );

    // 2. Pacientes activos (mascotas unicas con citas no canceladas)
    const activePets: any = await query(
      `SELECT COUNT(DISTINCT pet_name) as total FROM clinic_appointments
       WHERE clinic_id = ? AND status != 'cancelled'`,
      [clinicId]
    );

    // 3. Servicios activos
    const services: any = await query(
      `SELECT COUNT(*) as total FROM clinic_services
       WHERE clinic_id = ? AND active = 1`,
      [clinicId]
    );

    // 4. Personal (si existe la tabla, si no devuelve 0)
    let staffCount = 0;
    try {
      const staffResult: any = await query(
        `SELECT COUNT(*) as total FROM clinic_staff WHERE clinic_id = ?`,
        [clinicId]
      );
      staffCount = staffResult.rows?.[0]?.total || 0;
    } catch (e) {
      // Tabla no existe, usamos 0
      staffCount = 0;
    }

    // 5. Citas de hoy con detalles (para la tabla)
    const todayAppointmentsDetails: any = await query(
      `SELECT a.appointment_time, a.pet_name, a.client_name, s.name as service_name, a.status
       FROM clinic_appointments a
       LEFT JOIN clinic_services s ON a.service_id = s.id
       WHERE a.clinic_id = ? AND a.appointment_date = ? AND a.status != 'cancelled'
       ORDER BY a.appointment_time ASC`,
      [clinicId, today]
    );

    return NextResponse.json({
      success: true,
      stats: {
        todayAppointments: todayAppointments.rows?.[0]?.total || 0,
        activePets: activePets.rows?.[0]?.total || 0,
        services: services.rows?.[0]?.total || 0,
        staff: staffCount,
      },
      todayAppointmentsDetails: todayAppointmentsDetails.rows || [],
    });

  } catch (error: any) {
    console.error("Error al obtener stats:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}