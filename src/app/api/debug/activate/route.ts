import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Activar la clínica de prueba
    const result = await query(
      "UPDATE clinics SET status = 'active' WHERE email = ?",
      ["sistemdatos1@gmail.com"]
    );

    // Verificar que se actualizó
    const check = await query(
      "SELECT id, name, email, status FROM clinics WHERE email = ?",
      ["sistemdatos1@gmail.com"]
    );

    return NextResponse.json({ 
      message: "✅ Clínica activada exitosamente",
      data: check.rows 
    });
  } catch (error) {
    console.error("Error al activar:", error);
    return NextResponse.json({ 
      error: "No se pudo activar. Verifica que la tabla y la columna 'status' existan.",
      details: String(error) 
    }, { status: 500 });
  }
}