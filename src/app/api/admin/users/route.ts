import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Obtener todos los usuarios con conteo de mascotas
    const usersResult: any = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.email_verified,
        u.phone,
        u.whatsapp,
        COUNT(p.id) as pets_count
      FROM users u
      LEFT JOIN pets p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      users: usersResult.rows || [],
    });
  } catch (error: any) {
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}