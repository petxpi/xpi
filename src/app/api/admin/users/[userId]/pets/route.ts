import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const result: any = await query(
      `SELECT id, name, species, breed, color, sex, status, created_at
       FROM pets
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      pets: result.rows || [],
    });
  } catch (error: any) {
    console.error("Error obteniendo mascotas:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}