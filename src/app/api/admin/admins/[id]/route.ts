import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { active } = body;

    // Validar que active sea 0 o 1
    if (active !== 0 && active !== 1) {
      return NextResponse.json(
        { message: "El valor de active debe ser 0 o 1" },
        { status: 400 }
      );
    }

    // NO permitir desactivar al único admin activo
    if (active === 0) {
      const activeAdmins: any = await query(
        "SELECT COUNT(*) as count FROM admins WHERE active = 1"
      );
      if (activeAdmins.rows[0]?.count <= 1) {
        return NextResponse.json(
          { message: "No se puede desactivar el único admin activo" },
          { status: 400 }
        );
      }
    }

    await query(
      "UPDATE admins SET active = ?, updated_at = datetime('now') WHERE id = ?",
      [active, id]
    );

    return NextResponse.json({
      success: true,
      message: active === 1 ? "Admin activado" : "Admin desactivado",
    });
  } catch (error: any) {
    console.error("Error actualizando admin:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}