import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const usersResult: any = await query("SELECT COUNT(*) as count FROM users");
    const petsResult: any = await query("SELECT COUNT(*) as count FROM pets");
    const clinicsResult: any = await query("SELECT COUNT(*) as count FROM clinics");
    const appointmentsResult: any = await query("SELECT COUNT(*) as count FROM appointments");

    // Nuevas métricas
    const lostPetsResult: any = await query("SELECT COUNT(*) as count FROM pets WHERE status = 'lost'");
    const pendingClinicsResult: any = await query("SELECT COUNT(*) as count FROM clinics WHERE approved = 0");
    const todayAppointmentsResult: any = await query("SELECT COUNT(*) as count FROM appointments WHERE date(created_at) = date('now')");
    const todayUsersResult: any = await query("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')");

    return NextResponse.json({
      stats: {
        users: usersResult.rows[0]?.count || 0,
        pets: petsResult.rows[0]?.count || 0,
        clinics: clinicsResult.rows[0]?.count || 0,
        appointments: appointmentsResult.rows[0]?.count || 0,
        lostPets: lostPetsResult.rows[0]?.count || 0,
        pendingClinics: pendingClinicsResult.rows[0]?.count || 0,
        todayAppointments: todayAppointmentsResult.rows[0]?.count || 0,
        todayUsers: todayUsersResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    console.error("Error cargando stats:", error);
    return NextResponse.json({ stats: { users: 0, pets: 0, clinics: 0, appointments: 0, lostPets: 0, pendingClinics: 0, todayAppointments: 0, todayUsers: 0 } });
  }
}