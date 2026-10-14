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

// GET: Obtener galería de una mascota
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `SELECT * FROM pet_gallery WHERE pet_id = ?`;
    let params: any[] = [petId];

    if (publicOnly) {
      query += ` AND public = 1`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ photos: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener galería:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Agregar foto a la galería
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, photoUrl, category, caption, takenAt } = body;

    if (!petId || !photoUrl || !category) {
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
      `INSERT INTO pet_gallery (id, pet_id, photo_url, category, caption, taken_at, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [id, petId, photoUrl, category, caption || null, takenAt || null]
    );

    return NextResponse.json({ 
      message: "Foto agregada a la galería", 
      photoId: id 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al agregar foto:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar foto de la galería
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { photoId, petId } = body;

    if (!photoId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const check = await db.execute(
      `SELECT pg.id FROM pet_gallery pg 
       JOIN pets p ON pg.pet_id = p.id 
       WHERE pg.id = ? AND p.user_id = ?`,
      [photoId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM pet_gallery WHERE id = ?`, [photoId]);

    return NextResponse.json({ message: "Foto eliminada" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar foto:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}