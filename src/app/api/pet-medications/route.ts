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

// GET: Obtener medicamentos de una mascota (acepta UUID o public_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT pm.* 
      FROM pet_medications pm
      JOIN pets p ON pm.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    // Si es consulta pública, solo mostrar medicamentos marcados como públicos
    if (publicOnly) {
      query += ` AND pm.public = 1`;
    }

    query += ` ORDER BY pm.created_at DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ medications: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener medicamentos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Agregar un nuevo medicamento
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      petId, 
      medicationName, 
      dosage, 
      frequency, 
      schedule, 
      reason, 
      prescribedBy, 
      startDate, 
      endDate, 
      isPublic 
    } = body;

    if (!petId || !medicationName || !dosage || !frequency) {
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

    const id = crypto.randomUUID();
    const publicValue = isPublic === true ? 1 : 0;

    await db.execute(
      `INSERT INTO pet_medications (id, pet_id, medication_name, dosage, frequency, schedule, reason, prescribed_by, start_date, end_date, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, medicationName, dosage, frequency, schedule || null, reason || null, prescribedBy || null, startDate || null, endDate || null, publicValue]
    );

    return NextResponse.json({ message: "Medicamento registrado", medicationId: id }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar medicamento:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un medicamento
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { medicationId, petId } = body;

    if (!medicationId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT pm.id FROM pet_medications pm 
       JOIN pets p ON pm.pet_id = p.id 
       WHERE pm.id = ? AND p.user_id = ?`,
      [medicationId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM pet_medications WHERE id = ?`, [medicationId]);

    return NextResponse.json({ message: "Medicamento eliminado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar medicamento:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// PATCH: Toggle de visibilidad pública
export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { medicationId, petId } = body;

    if (!medicationId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT pm.id, pm.public FROM pet_medications pm 
       JOIN pets p ON pm.pet_id = p.id 
       WHERE pm.id = ? AND p.user_id = ?`,
      [medicationId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const currentPublic = (check.rows[0] as any).public;
    const newPublic = currentPublic === 1 ? 0 : 1;

    await db.execute(
      `UPDATE pet_medications SET public = ? WHERE id = ?`,
      [newPublic, medicationId]
    );

    return NextResponse.json({ 
      message: newPublic === 1 ? "Medicamento ahora es público" : "Medicamento ahora es privado",
      public: newPublic 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error al cambiar visibilidad:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}