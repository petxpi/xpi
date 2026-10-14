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
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT v.* 
      FROM veterinarians v
      JOIN pets p ON v.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    // Si es consulta pública, solo mostrar si está marcado como público
    if (publicOnly) {
      query += ` AND v.public = 1`;
    }

    const result = await db.execute(query, params);

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
    const { petId, vetName, clinicName, phone, address, notes, isPublic } = body;

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
    // isPublic: 1 si es público, 0 si es privado (por defecto 1 para mantener compatibilidad)
    const publicValue = isPublic === false ? 0 : 1;

    await db.execute(
      `INSERT INTO veterinarians (id, pet_id, vet_name, clinic_name, phone, address, notes, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, vetName, clinicName || null, phone || null, address || null, notes || null, publicValue]
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