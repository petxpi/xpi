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

    // WHITELIST estricta: solo campos que existen en tu tabla pets
    const safeData: Record<string, string | null> = {
      name: body.name != null ? String(body.name) : null,
      species: body.species != null ? String(body.species) : null,
      breed: body.breed != null ? String(body.breed) : null,
      color: body.color != null ? String(body.color) : null,
      sex: body.sex != null ? String(body.sex) : null,
      microchip: body.microchip != null ? String(body.microchip) : null,
    };

    const existing = await db.execute(
      "SELECT id FROM pets WHERE id = ? AND user_id = ?",
      [petId, userId]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
    }

    // UPDATE sin updated_at, coincidiendo exactamente con tu schema actual
    await db.execute(
      "UPDATE pets SET name = ?, species = ?, breed = ?, color = ?, sex = ?, microchip = ? WHERE id = ? AND user_id = ?",
      [
        safeData.name,
        safeData.species,
        safeData.breed,
        safeData.color,
        safeData.sex,
        safeData.microchip,
        petId,
        userId
      ]
    );

    return NextResponse.json({ message: "Mascota actualizada" }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(
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
    const status = body.status != null ? String(body.status) : null;
    const lostReport = body.lost_report != null ? String(body.lost_report) : null;

    const existing = await db.execute(
      "SELECT id FROM pets WHERE id = ? AND user_id = ?",
      [petId, userId]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
    }

    await db.execute(
      "UPDATE pets SET status = ?, lost_report = ? WHERE id = ?",
      [status, lostReport, petId]
    );

    return NextResponse.json({ message: "Mascota marcada como " + status }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.execute(
      "UPDATE pets SET deleted_at = datetime('now') WHERE id = ? AND user_id = ?",
      [petId, userId]
    );

    return NextResponse.json({ message: "Mascota eliminada" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}