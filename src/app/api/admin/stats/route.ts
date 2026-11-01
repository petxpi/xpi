import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const usersResult: any = await query("SELECT COUNT(*) as count FROM users");
    const petsResult: any = await query("SELECT COUNT(*) as count FROM pets");
    const clinicsResult: any = await query("SELECT COUNT(*) as count FROM clinics");
    const appointmentsResult: any = await query("SELECT COUNT(*) as count FROM appointments");

    return NextResponse.json({
      stats: {
        users: usersResult.rows[0]?.count || 0,
        pets: petsResult.rows[0]?.count || 0,
        clinics: clinicsResult.rows[0]?.count || 0,
        appointments: appointmentsResult.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    console.error("Error cargando stats:", error);
    return NextResponse.json({ stats: { users: 0, pets: 0, clinics: 0, appointments: 0 } });
  }
}