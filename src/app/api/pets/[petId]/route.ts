import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    const { name, species, breed, color, sex, microchip, status, photo_url } = body;

    await db.execute(
      `UPDATE pets 
       SET name = ?, species = ?, breed = ?, color = ?, sex = ?, microchip = ?, status = ?, photo_url = ?
       WHERE id = ?`,
      [name, species, breed, color, sex, microchip || "", status || "home", photo_url || null, petId]
    );

    return NextResponse.json(
      { message: "Mascota actualizada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(" Error al actualizar mascota:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { status, lost_report } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    if (lost_report !== undefined) {
      updates.push("lost_report = ?");
      values.push(lost_report);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    values.push(petId);

    const sql = `UPDATE pets SET ${updates.join(", ")} WHERE id = ?`;
    
    await db.execute(sql, values);

    return NextResponse.json(
      { message: "Mascota actualizada parcialmente" },
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