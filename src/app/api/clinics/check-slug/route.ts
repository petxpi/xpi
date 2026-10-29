import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ available: true });
    }

    const result: any = await query(
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