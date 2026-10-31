import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params;
    console.log("🔍 Buscando clínica con ID:", clinicId);

    const clinicResult = await query(
      "SELECT * FROM clinics WHERE id = ? AND status = 'active'",
      [clinicId]
    );

    if (!clinicResult.rows || clinicResult.rows.length === 0) {
      console.log("❌ Clínica no encontrada");
      return NextResponse.json(
        { message: "Clínica no encontrada" },
        { status: 404 }
      );
    }

    const clinic = clinicResult.rows[0];
    console.log("✅ Clínica encontrada:", (clinic as any).name);

    const servicesResult = await query(
      "SELECT * FROM clinic_services WHERE clinic_id = ? AND active = 1 ORDER BY name ASC",
      [clinicId]
    );

    return NextResponse.json({
      clinic,
      services: servicesResult.rows || [],
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error: " + error.message },
      { status: 500 }
    );
  }
}