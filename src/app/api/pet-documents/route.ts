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

// GET: Obtener documentos de una mascota
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT pd.* 
      FROM pet_documents pd
      JOIN pets p ON pd.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    if (publicOnly) {
      query += ` AND pd.public = 1`;
    }

    query += ` ORDER BY pd.created_at DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ documents: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener documentos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// POST: Agregar un documento
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { petId, documentUrl, documentType, documentName, issueDate, expiryDate } = body;

    if (!petId || !documentUrl || !documentType) {
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
      `INSERT INTO pet_documents (id, pet_id, document_url, document_type, document_name, issue_date, expiry_date, public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [id, petId, documentUrl, documentType, documentName || null, issueDate || null, expiryDate || null]
    );

    return NextResponse.json({ 
      message: "Documento agregado", 
      documentId: id 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al agregar documento:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un documento
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, petId } = body;

    if (!documentId || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const check = await db.execute(
      `SELECT pd.id FROM pet_documents pd 
       JOIN pets p ON pd.pet_id = p.id 
       WHERE pd.id = ? AND p.user_id = ?`,
      [documentId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await db.execute(`DELETE FROM pet_documents WHERE id = ?`, [documentId]);

    return NextResponse.json({ message: "Documento eliminado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}