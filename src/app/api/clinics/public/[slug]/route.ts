import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Obtener datos de la clínica
    const clinicResult = await query(
      `SELECT id, name, slug, logo_url, business_image_url, phone, address, city, country, specialty, description
       FROM clinics 
       WHERE slug = ? AND status = 'active'`,
      [slug]
    );

    if (!clinicResult.rows || clinicResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Clínica no encontrada" },
        { status: 404 }
      );
    }

    const clinic = clinicResult.rows[0] as any;

    // Obtener servicios activos
    const servicesResult = await query(
      `SELECT id, name, description, price, duration_minutes, category, specialty
       FROM clinic_services 
       WHERE clinic_id = ? AND active = 1
       ORDER BY name ASC`,
      [clinic.id]
    );

    return NextResponse.json({
      clinic,
      services: servicesResult.rows || [],
    });
  } catch (error) {
    console.error("Error al obtener clínica pública:", error);
    return NextResponse.json(
      { message: "Error al cargar la clínica" },
      { status: 500 }
    );
  }
}