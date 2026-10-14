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

// GET: Obtener alergias de una mascota (acepta UUID o public_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT pa.* 
      FROM pet_allergies pa
      JOIN pets p ON pa.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    // Si es consulta pública, solo mostrar alergias marcadas como públicas
    if (publicOnly) {
      query += ` AND pa.public = 1`;
    }

    query += ` ORDER BY pa.created_at DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ allergies: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener alergias:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Agregar una nueva alergia
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, allergyType, allergen, severity, symptoms, treatment, isPublic } = body;

    if (!petId || !allergyType || !allergen || !severity) {
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
      `INSERT INTO pet_allergies (id, pet_id, allergy_type, allergen, severity, symptoms, treatment, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, petId, allergyType, allergen, severity, symptoms || null, treatment || null, publicValue]
    );

    return NextResponse.json({ message: "Alergia registrada", allergyId: id }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar alergia:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar una alergia
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { allergyId, petId } = body;

    if (!allergyId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT pa.id FROM pet_allergies pa 
       JOIN pets p ON pa.pet_id = p.id 
       WHERE pa.id = ? AND p.user_id = ?`,
      [allergyId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM pet_allergies WHERE id = ?`, [allergyId]);

    return NextResponse.json({ message: "Alergia eliminada" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar alergia:", error);
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
    const { allergyId, petId } = body;

    if (!allergyId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar propiedad
    const check = await db.execute(
      `SELECT pa.id, pa.public FROM pet_allergies pa 
       JOIN pets p ON pa.pet_id = p.id 
       WHERE pa.id = ? AND p.user_id = ?`,
      [allergyId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const currentPublic = (check.rows[0] as any).public;
    const newPublic = currentPublic === 1 ? 0 : 1;

    await db.execute(
      `UPDATE pet_allergies SET public = ? WHERE id = ?`,
      [newPublic, allergyId]
    );

    return NextResponse.json({ 
      message: newPublic === 1 ? "Alergia ahora es pública" : "Alergia ahora es privada",
      public: newPublic 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error al cambiar visibilidad:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}