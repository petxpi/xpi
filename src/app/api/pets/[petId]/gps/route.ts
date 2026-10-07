import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ==========================================
// ACTUALIZAR estado del GPS (Activar/Desactivar)
// ==========================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params;
    const body = await request.json();
    const { enabled } = body;

    if (!petId) {
      return NextResponse.json(
        { message: "ID de la mascota no proporcionado" },
        { status: 400 }
      );
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { message: "El campo 'enabled' debe ser true o false" },
        { status: 400 }
      );
    }

    await db.execute(
      `UPDATE pets SET gps_enabled = ? WHERE id = ?`,
      [enabled ? 1 : 0, petId]
    );

    return NextResponse.json(
      { message: `GPS ${enabled ? "activado" : "desactivado"} exitosamente` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al cambiar estado del GPS:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// ACTUALIZAR ubicación GPS de la mascota
// ==========================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
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

    await db.execute(
      `UPDATE pets SET last_known_location_lat = ?, last_known_location_lng = ?, last_location_updated_at = datetime('now') WHERE id = ?`,
      [lat, lng, petId]
    );

    return NextResponse.json(
      { message: "Ubicación GPS actualizada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al actualizar ubicación GPS:", error);
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
      `SELECT last_known_location_lat, last_known_location_lng, gps_enabled FROM pets WHERE id = ?`,
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
        lat: pet.last_known_location_lat, 
        lng: pet.last_known_location_lng,
        gps_enabled: pet.gps_enabled
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