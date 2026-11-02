import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result: any = await query(`
      SELECT id, name, email, role, active, created_at, updated_at
      FROM admins
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      admins: result.rows || [],
    });
  } catch (error: any) {
    console.error("Error obteniendo admins:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}