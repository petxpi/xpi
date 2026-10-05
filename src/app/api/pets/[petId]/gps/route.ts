import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ==========================================
// ACTUALIZAR ubicación GPS de la mascota
// ==========================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    // En Next.js 15, params es una Promesa, así que debemos esperar por ella
    const { petId } = await params;
    
    const body = await request.json();
    const { lat, lng } = body;

    if (!petId) {
      return NextResponse.json(
        { message: "ID de la mascota no proporcionado" },
        { status: 400 }
      );
    }

    if (!lat || !lng) {
      return NextResponse.json(
        { message: "Latitud y longitud son obligatorias" },
        { status: 400 }
      );
    }

    // Actualizar la ubicación en la base de datos
    await db.execute(
      `UPDATE pets SET location_lat = ?, location_lng = ?, updated_at = datetime('now') WHERE id = ?`,
      [lat, lng, petId]
    );

    return NextResponse.json(
      { message: "Ubicación GPS actualizada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al actualizar GPS:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// OBTENER ubicación GPS de la mascota
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params;

    if (!petId) {
      return NextResponse.json(
        { message: "ID de la mascota no proporcionado" },
        { status: 400 }
      );
    }

    const result = await db.execute(
      `SELECT location_lat, location_lng FROM pets WHERE id = ?`,
      [petId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Mascota no encontrada" },
        { status: 404 }
      );
    }

    const pet = result.rows[0] as any;

    return NextResponse.json(
      { 
        lat: pet.location_lat, 
        lng: pet.location_lng 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener GPS:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}