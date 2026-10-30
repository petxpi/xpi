import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    await query(
      `DELETE FROM clinic_appointments WHERE id = ? AND clinic_id = ?`,
      [id, clinicId]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Cita eliminada" 
    });

  } catch (error: any) {
    console.error("Error DELETE appointment:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}