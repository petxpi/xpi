import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Ver estructura de la tabla users
    const schemaResult = await query("PRAGMA table_info(users)");
    
    // Ver un usuario de ejemplo (sin password)
    const userResult = await query("SELECT id, name, email, created_at FROM users LIMIT 1");
    
    return NextResponse.json({
      columns: schemaResult.rows,
      sampleUser: userResult.rows?.[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}