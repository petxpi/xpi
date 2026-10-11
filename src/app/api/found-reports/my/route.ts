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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const result = await db.execute(
      `SELECT fr.*, p.name as pet_name, p.public_id as pet_public_id
       FROM found_reports fr
       JOIN pets p ON fr.pet_id = p.id
       WHERE p.user_id = ?
       ORDER BY fr.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ reports: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error al obtener reportes:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, status } = body;

    await db.execute(
      `UPDATE found_reports SET status = ? WHERE id = ?`,
      [status, reportId]
    );

    return NextResponse.json({ message: "✅ Estado actualizado" }, { status: 200 });
  } catch (error: any) {
    console.error(" Error al actualizar reporte:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}