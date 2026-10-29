import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    // 1. Total de pacientes
    const patientsResult = await query(
      `SELECT COUNT(*) as total FROM clinic_patients WHERE clinic_id = ?`,
      [clinicId]
    );
    const totalPatients = (patientsResult.rows as any[])?.[0]?.total || 0;

    // 2. Distribución por especie
    const speciesResult = await query(
      `SELECT species, COUNT(*) as total FROM clinic_patients WHERE clinic_id = ? GROUP BY species`,
      [clinicId]
    );

    // 3. Citas totales y por estado
    const appointmentsResult = await query(
      `SELECT status, COUNT(*) as total FROM clinic_appointments WHERE clinic_id = ? GROUP BY status`,
      [clinicId]
    );

    // 4. Citas del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-10"
    const monthAppointmentsResult = await query(
      `SELECT COUNT(*) as total FROM clinic_appointments WHERE clinic_id = ? AND appointment_date LIKE ?`,
      [clinicId, `${currentMonth}%`]
    );
    const monthAppointments = (monthAppointmentsResult.rows as any[])?.[0]?.total || 0;

    // 5. Vacunas por vencer (próximos 30 días)
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const expiringVaccinesResult = await query(
      `SELECT v.*, p.name as pet_name, p.id as pet_id
       FROM clinic_vaccines v
       JOIN clinic_patients p ON v.pet_id = p.id
       WHERE p.clinic_id = ? AND v.next_due_date >= ? AND v.next_due_date <= ?
       ORDER BY v.next_due_date ASC`,
      [clinicId, today, nextMonth]
    );

    // 6. Mascotas con alergias severas
    const severeAllergiesResult = await query(
      `SELECT a.*, p.name as pet_name, p.id as pet_id
       FROM clinic_allergies a
       JOIN clinic_patients p ON a.pet_id = p.id
       WHERE p.clinic_id = ? AND a.severity = 'Severa'`,
      [clinicId]
    );

    // 7. Próximas citas (pendientes)
    const upcomingAppointmentsResult = await query(
      `SELECT a.*, p.name as pet_name
       FROM clinic_appointments a
       LEFT JOIN clinic_patients p ON a.pet_id = p.id
       WHERE a.clinic_id = ? AND a.status = 'pending' AND a.appointment_date >= ?
       ORDER BY a.appointment_date ASC
       LIMIT 10`,
      [clinicId, today]
    );

    return NextResponse.json({
      success: true,
      data: {
        totalPatients,
        species: speciesResult.rows || [],
        appointmentsByStatus: appointmentsResult.rows || [],
        monthAppointments,
        expiringVaccines: expiringVaccinesResult.rows || [],
        severeAllergies: severeAllergiesResult.rows || [],
        upcomingAppointments: upcomingAppointmentsResult.rows || []
      }
    });

  } catch (error: any) {
    console.error("Error en reportes:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}