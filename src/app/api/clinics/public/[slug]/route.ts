import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log("🔍 Buscando clínica con slug:", slug);

    // Buscar clínica activa con ese slug en TURSO
    const clinicResult = await query(
      "SELECT * FROM clinics WHERE slug = ? AND status = 'active'",
      [slug]
    );

    if (!clinicResult.rows || clinicResult.rows.length === 0) {
      console.log("❌ Clínica no encontrada o no está activa");
      return NextResponse.json(
        { message: "Clínica no encontrada" },
        { status: 404 }
      );
    }

    const clinic = clinicResult.rows[0];
    console.log("✅ Clínica encontrada:", (clinic as any).name);

    // Obtener servicios activos
    const servicesResult = await query(
      "SELECT * FROM clinic_services WHERE clinic_id = ? AND active = 1 ORDER BY name ASC",
      [(clinic as any).id]
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