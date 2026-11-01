import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { approved } = body;

    // Validar que approved sea 0 o 1
    if (approved !== 0 && approved !== 1) {
      return NextResponse.json(
        { message: "El valor de approved debe ser 0 o 1" },
        { status: 400 }
      );
    }

    // SOLO actualizamos el campo approved, nada más
    await query(
      "UPDATE clinics SET approved = ?, updated_at = datetime('now') WHERE id = ?",
      [approved, id]
    );

    return NextResponse.json({
      success: true,
      message: approved === 1 ? "Clínica aprobada" : "Clínica rechazada",
    });
  } catch (error: any) {
    console.error("Error actualizando clínica:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}