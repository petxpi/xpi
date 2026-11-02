import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result: any = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        specialty,
        plan_type,
        approved,
        status,
        logo_url,
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