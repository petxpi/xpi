import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const columnsToAdd = [
      "ALTER TABLE clinics ADD COLUMN logo_url TEXT",
      "ALTER TABLE clinics ADD COLUMN banner_url TEXT",
      "ALTER TABLE clinics ADD COLUMN primary_color TEXT DEFAULT '#7c3aed'",
      "ALTER TABLE clinics ADD COLUMN secondary_color TEXT DEFAULT '#10b981'",
      "ALTER TABLE clinics ADD COLUMN currency TEXT DEFAULT 'COP'",
      "ALTER TABLE clinics ADD COLUMN tax_rate REAL DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN email_notifications INTEGER DEFAULT 1",
      "ALTER TABLE clinics ADD COLUMN sms_notifications INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN reminder_hours INTEGER DEFAULT 24"
    ];

    const results = [];
    for (const sql of columnsToAdd) {
      try {
        await query(sql);
        results.push({ sql, status: "success" });
      } catch (e: any) {
        if (e.message && e.message.includes("duplicate column name")) {
          results.push({ sql, status: "already exists" });
        } else {
          results.push({ sql, status: "error", message: e.message });
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}