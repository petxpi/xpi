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

// GET: Obtener registros de peso de una mascota (acepta UUID o public_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT pw.* 
      FROM pet_weights pw
      JOIN pets p ON pw.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    if (publicOnly) {
      query += ` AND pw.public = 1`;
    }

    query += ` ORDER BY pw.date DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ weights: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener registros de peso:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Registrar un nuevo peso
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, weight, date, notes, isPublic } = body;

    if (!petId || weight === undefined || weight === null || !date) {
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
      `INSERT INTO pet_weights (id, pet_id, weight, date, notes, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, weight, date, notes || null, publicValue]
    );

    return NextResponse.json({ message: "Peso registrado", weightId: id }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar peso:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un registro de peso
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { weightId, petId } = body;

    if (!weightId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT pw.id FROM pet_weights pw 
       JOIN pets p ON pw.pet_id = p.id 
       WHERE pw.id = ? AND p.user_id = ?`,
      [weightId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM pet_weights WHERE id = ?`, [weightId]);

    return NextResponse.json({ message: "Registro de peso eliminado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar registro de peso:", error);
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
    const { weightId, petId } = body;

    if (!weightId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT pw.id, pw.public FROM pet_weights pw 
       JOIN pets p ON pw.pet_id = p.id 
       WHERE pw.id = ? AND p.user_id = ?`,
      [weightId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const currentPublic = (check.rows[0] as any).public;
    const newPublic = currentPublic === 1 ? 0 : 1;

    await db.execute(
      `UPDATE pet_weights SET public = ? WHERE id = ?`,
      [newPublic, weightId]
    );

    return NextResponse.json({ 
      message: newPublic === 1 ? "Registro ahora es público" : "Registro ahora es privado",
      public: newPublic 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error al cambiar visibilidad:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}