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

// GET: Obtener veterinario(s) de una mascota
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    // Usamos JOIN para que funcione tanto con el UUID interno como con el public_id (ej: XPI-SKFU3C)
    const query = `
      SELECT v.* 
      FROM veterinarians v
      JOIN pets p ON v.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
      ORDER BY v.created_at DESC
    `;

    const result = await db.execute(query, [petId, petId]);

    return NextResponse.json({ veterinarians: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener veterinarios:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Agregar veterinario
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, vetName, clinicName, phone, address, notes } = body;

    if (!petId || !vetName) {
      return NextResponse.json({ message: "Faltan campos obligatorios (petId, vetName)" }, { status: 400 });
    }

    // Verificar que la mascota pertenezca al usuario
    const petCheck = await db.execute(
      `SELECT id FROM pets WHERE id = ? AND user_id = ?`,
      [petId, userId]
    );

    if (petCheck.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada o no pertenece al usuario" }, { status: 404 });
    }

    const id = crypto.randomUUID();

    await db.execute(
      `INSERT INTO veterinarians (id, pet_id, vet_name, clinic_name, phone, address, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, vetName, clinicName || null, phone || null, address || null, notes || null]
    );

    return NextResponse.json({ 
      message: "Veterinario agregado", 
      vetId: id 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al agregar veterinario:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// PUT: Actualizar veterinario
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, petId, vetName, clinicName, phone, address, notes } = body;

    if (!id || !petId || !vetName) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT v.id FROM veterinarians v 
       JOIN pets p ON v.pet_id = p.id 
       WHERE v.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(
      `UPDATE veterinarians 
       SET vet_name = ?, clinic_name = ?, phone = ?, address = ?, notes = ? 
       WHERE id = ?`,
      [vetName, clinicName || null, phone || null, address || null, notes || null, id]
    );

    return NextResponse.json({ message: "Veterinario actualizado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar veterinario:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
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
    const { id, petId } = body;

    if (!id || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const check = await db.execute(
      `SELECT v.id FROM veterinarians v 
       JOIN pets p ON v.pet_id = p.id 
       WHERE v.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM veterinarians WHERE id = ?`, [id]);

    return NextResponse.json({ message: "Veterinario eliminado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar veterinario:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}