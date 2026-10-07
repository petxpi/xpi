import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ==========================================
// OBTENER mascota por ID
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params;

    if (!petId) {
      return NextResponse.json(
        { message: "ID de mascota no válido" },
        { status: 400 }
      );
    }

    const result = await db.execute(
      `SELECT * FROM pets WHERE id = ?`,
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
      { pet },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener mascota:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// ACTUALIZAR mascota (CORREGIDO - sin updated_at)
// ==========================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params;

    if (!petId) {
      return NextResponse.json(
        { message: "ID de mascota no válido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, species, breed, color, sex, microchip, status } = body;

    await db.execute(
      `UPDATE pets 
       SET name = ?, species = ?, breed = ?, color = ?, sex = ?, microchip = ?, status = ?
       WHERE id = ?`,
      [name, species, breed, color, sex, microchip || "", status || "home", petId]
    );

    return NextResponse.json(
      { message: "Mascota actualizada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al actualizar mascota:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// ELIMINAR mascota
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params;

    if (!petId) {
      return NextResponse.json(
        { message: "ID de mascota no válido" },
        { status: 400 }
      );
    }

    await db.execute(
      `DELETE FROM pets WHERE id = ?`,
      [petId]
    );

    return NextResponse.json(
      { message: "Mascota eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al eliminar mascota:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}