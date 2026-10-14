export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");
    if (!token) return null;
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

// GET: Obtener veterinario de una mascota (acepta UUID o public_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    const result = await db.execute(
      `SELECT v.* 
       FROM veterinarians v
       JOIN pets p ON v.pet_id = p.id
       WHERE (p.id = ? OR p.public_id = ?)`,
      [petId, petId]
    );

    const vet = result.rows.length > 0 ? result.rows[0] : null;

    return NextResponse.json({ vet }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener veterinario:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Guardar o actualizar veterinario (1 a 1 por mascota)
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, vetName, clinicName, phone, address, notes } = body;

    if (!petId || !vetName) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que la mascota sea del usuario
    const petCheck = await db.execute(
      `SELECT id FROM pets WHERE id = ? AND user_id = ?`,
      [petId, userId]
    );

    if (petCheck.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
    }

    // Eliminar veterinario anterior si existe (para mantener 1 a 1)
    await db.execute(`DELETE FROM veterinarians WHERE pet_id = ?`, [petId]);

    const id = crypto.randomUUID();

    await db.execute(
      `INSERT INTO veterinarians (id, pet_id, vet_name, clinic_name, phone, address, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, vetName, clinicName || null, phone || null, address || null, notes || null]
    );

    return NextResponse.json({ message: "Veterinario guardado", vetId: id }, { status: 201 });
  } catch (error: any) {
    console.error("Error al guardar veterinario:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar veterinario
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId } = body;

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    await db.execute(`DELETE FROM veterinarians WHERE pet_id = ?`, [petId]);

    return NextResponse.json({ message: "Veterinario eliminado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar veterinario:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}