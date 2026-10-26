import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug || slug.length < 3) {
      return NextResponse.json({ available: false });
    }

    const result = await query(
      "SELECT id FROM clinics WHERE slug = ?",
      [slug]
    );

    return NextResponse.json({ 
      available: !result.rows || result.rows.length === 0 
    });
  } catch (error) {
    return NextResponse.json({ available: true });
  }
}