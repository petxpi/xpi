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

// GET: Obtener hitos de una mascota
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `SELECT * FROM pet_milestones WHERE pet_id = ?`;
    let params: any[] = [petId];

    if (publicOnly) {
      query += ` AND public = 1`;
    }

    query += ` ORDER BY milestone_date DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ milestones: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener hitos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Agregar un hito
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, title, description, milestoneDate, category, photoUrl } = body;

    if (!petId || !title || !milestoneDate) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const petCheck = await db.execute(
      `SELECT id FROM pets WHERE id = ? AND user_id = ?`,
      [petId, userId]
    );

    if (petCheck.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada o no pertenece al usuario" }, { status: 404 });
    }

    const id = crypto.randomUUID();

    await db.execute(
      `INSERT INTO pet_milestones (id, pet_id, title, description, milestone_date, category, photo_url, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [id, petId, title, description || null, milestoneDate, category || null, photoUrl || null]
    );

    return NextResponse.json({ 
      message: "Hito agregado", 
      milestoneId: id 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al agregar hito:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un hito
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { milestoneId, petId } = body;

    if (!milestoneId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const check = await db.execute(
      `SELECT pm.id FROM pet_milestones pm 
       JOIN pets p ON pm.pet_id = p.id 
       WHERE pm.id = ? AND p.user_id = ?`,
      [milestoneId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM pet_milestones WHERE id = ?`, [milestoneId]);

    return NextResponse.json({ message: "Hito eliminado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar hito:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}