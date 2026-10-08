import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

function generatePublicId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "XPI-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;

    const result = await db.execute(
      "SELECT * FROM pets WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({ pets: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;

    const body = await request.json();
    // AGREGADO: photo al destructuring
    const { name, species, breed, color, sex, microchip, photo } = body;

    if (!name || !species) {
      return NextResponse.json(
        { message: "Nombre y especie son obligatorios" },
        { status: 400 }
      );
    }

    const petId = crypto.randomUUID();
    const publicId = generatePublicId();

    // AGREGADO: photo_url en el INSERT
    await db.execute(
      `INSERT INTO pets (id, public_id, user_id, name, species, breed, color, sex, microchip, photo_url, status, gps_enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'home', 0, datetime('now'))`,
      // AGREGADO: photo al final del array
      [petId, publicId, userId, name, species, breed || null, color || null, sex || null, microchip || null, photo || null]
    );

    return NextResponse.json(
      { message: "Mascota creada exitosamente", petId, publicId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear mascota:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}