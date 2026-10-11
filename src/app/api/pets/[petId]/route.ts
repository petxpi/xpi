import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;
    const petId = params.id;

    const body = await request.json();
    // AGREGADO: photo al destructuring
    const { name, species, breed, color, sex, microchip, photo } = body;

    if (!name || !species) {
      return NextResponse.json(
        { message: "Nombre y especie son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que la mascota pertenece al usuario
    const checkResult = await db.execute(
      "SELECT id FROM pets WHERE id = ? AND user_id = ?",
      [petId, userId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada o no autorizada" }, { status: 404 });
    }

    // AGREGADO: photo_url en el UPDATE
    await db.execute(
      `UPDATE pets 
       SET name = ?, species = ?, breed = ?, color = ?, sex = ?, microchip = ?, photo_url = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [name, species, breed || null, color || null, sex || null, microchip || null, photo || null, petId, userId]
    );

    return NextResponse.json(
      { message: "Mascota actualizada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar mascota:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;
    const petId = params.id;

    await db.execute(
      "UPDATE pets SET deleted_at = datetime('now') WHERE id = ? AND user_id = ?",
      [petId, userId]
    );

    return NextResponse.json({ message: "Mascota eliminada exitosamente" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar mascota:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;
    const petId = params.id;

    const body = await request.json();
    const { status, lost_report } = body;

    await db.execute(
      `UPDATE pets 
       SET status = ?, lost_report = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [status || 'home', lost_report || null, petId, userId]
    );

    return NextResponse.json({ message: "Estado actualizado exitosamente" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}