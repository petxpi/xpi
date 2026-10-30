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
      `SELECT id, name, price, duration_minutes, active, category
       FROM clinic_services 
       WHERE clinic_id = ? AND active = 1 
       ORDER BY name`,
      [clinicId]
    );

    return NextResponse.json({ 
      success: true, 
      services: result.rows || [] 
    });

  } catch (error: any) {
    console.error("Error GET services:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}