import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function GET(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ isOwner: false });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Verificar si el usuario es dueño de esta clínica
    const result: any = await query(
      "SELECT id FROM clinics WHERE id = ? AND owner_id = ?",
      [params.clinicId, userId]
    );

    const isOwner = result.rows && result.rows.length > 0;
    return NextResponse.json({ isOwner });

  } catch (error) {
    console.error("Error check-owner:", error);
    return NextResponse.json({ isOwner: false });
  }
}