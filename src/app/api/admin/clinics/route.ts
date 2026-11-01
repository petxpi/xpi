import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // SOLO LECTURA - No modificamos nada de la tabla clinics
    const result: any = await query(`
      SELECT 
        id,
        clinic_name,
        clinic_slug,
        clinic_subtitle,
        email,
        phone,
        address,
        city,
        country,
        specialty,
        approved,
        status,
        plan_type,
        created_at
      FROM clinics
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      clinics: result.rows || [],
    });
  } catch (error: any) {
    console.error("Error obteniendo clínicas:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}