import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result: any = await query(`PRAGMA table_info(clinics)`);
    return NextResponse.json({ success: true, columns: result.rows });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}