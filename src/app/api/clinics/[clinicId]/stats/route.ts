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

    console.log("Stats - Fecha:", today, "ClinicId:", clinicId);

    let todayAppointments = 0;
    let activePets = 0;
    let services = 0;
    let staffCount = 0;
    let todayAppointmentsDetails: any[] = [];

    // 1. Citas de hoy
    try {
      const result: any = await query(
        `SELECT COUNT(*) as total FROM clinic_appointments
         WHERE clinic_id = ? AND appointment_date = ? AND status != 'cancelled'`,
        [clinicId, today]
      );
      todayAppointments = result.rows?.[0]?.total || 0;
    } catch (e) {
      console.log("Error citas hoy:", e);
    }

    // 2. Pacientes activos (total de mascotas registradas)
    try {
      const result: any = await query(
        `SELECT COUNT(*) as total FROM clinic_patients WHERE clinic_id = ?`,
        [clinicId]
      );
      activePets = result.rows?.[0]?.total || 0;
    } catch (e) {
      console.log("Error pacientes:", e);
    }

    // 3. Servicios activos
    try {
      const result: any = await query(
        `SELECT COUNT(*) as total FROM clinic_services
         WHERE clinic_id = ? AND active = 1`,
        [clinicId]
      );
      services = result.rows?.[0]?.total || 0;
    } catch (e) {
      console.log("Error servicios:", e);
    }

    // 4. Personal activo
    try {
      const result: any = await query(
        `SELECT COUNT(*) as total FROM clinic_staff
         WHERE clinic_id = ? AND (active = 1 OR status = 'active')`,
        [clinicId]
      );
      staffCount = result.rows?.[0]?.total || 0;
    } catch (e) {
      console.log("Error personal:", e);
    }

    // 5. Detalles de citas de hoy
    try {
      const result: any = await query(
        `SELECT a.appointment_date, a.status, a.service_id, a.patient_id,
                p.name as pet_name, p.species,
                s.name as service_name
         FROM clinic_appointments a
         LEFT JOIN clinic_patients p ON a.patient_id = p.id
         LEFT JOIN clinic_services s ON a.service_id = s.id
         WHERE a.clinic_id = ? AND a.appointment_date = ? AND a.status != 'cancelled'
         ORDER BY a.appointment_date ASC`,
        [clinicId, today]
      );
      todayAppointmentsDetails = result.rows || [];
    } catch (e) {
      console.log("Error detalles citas:", e);
    }

    return NextResponse.json({
      success: true,
      stats: {
        todayAppointments,
        activePets,
        services,
        staff: staffCount,
      },
      todayAppointmentsDetails,
    });

  } catch (error: any) {
    console.error("Error stats:", error);
    return NextResponse.json({ 
      success: false,
      message: error.message,
      stats: { todayAppointments: 0, activePets: 0, services: 0, staff: 0 },
      todayAppointmentsDetails: []
    }, { status: 200 });
  }
}