import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const resolvedParams = await params;
    const petId = resolvedParams.petId || resolvedParams.id || (resolvedParams as any)[Object.keys(resolvedParams)[0]];

    if (!petId) {
      return NextResponse.json({ message: "ID de mascota no válido" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;

    const body = await request.json();
    
    // Convertir booleano a entero (1 o 0) para SQLite
    const enabled = body.enabled ? 1 : 0;

    const existing = await db.execute(
      "SELECT id FROM pets WHERE id = ? AND user_id = ?",
      [petId, userId]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
    }

    await db.execute(
      "UPDATE pets SET gps_enabled = ? WHERE id = ?",
      [enabled, petId]
    );

    return NextResponse.json({ message: "GPS actualizado" }, { status: 200 });
  } catch (error) {
    console.error("Error al cambiar GPS:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}