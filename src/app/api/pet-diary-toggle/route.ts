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

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, itemType, petId } = body;

    if (!itemId || !itemType || !petId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    let tableName = "";
    if (itemType === "gallery") tableName = "pet_gallery";
    else if (itemType === "milestone") tableName = "pet_milestones";
    else if (itemType === "document") tableName = "pet_documents";
    else return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });

    const check = await db.execute(
      `SELECT ${tableName}.id FROM ${tableName} 
       JOIN pets p ON ${tableName}.pet_id = p.id 
       WHERE ${tableName}.id = ? AND p.user_id = ?`,
      [itemId, userId]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const current = await db.execute(
      `SELECT public FROM ${tableName} WHERE id = ?`,
      [itemId]
    );

    const currentPublic = (current.rows[0] as any).public;
    const newPublic = currentPublic === 1 ? 0 : 1;

    await db.execute(
      `UPDATE ${tableName} SET public = ? WHERE id = ?`,
      [newPublic, itemId]
    );

    return NextResponse.json({ 
      message: newPublic === 1 ? "Ahora es publico" : "Ahora es privado",
      public: newPublic 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error al cambiar visibilidad:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}