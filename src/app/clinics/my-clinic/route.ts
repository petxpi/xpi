import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Aquí deberías verificar la sesión del usuario
    // Por ahora, simulamos que no tiene clínica
    return NextResponse.json({ clinic: null });
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar clínica" }, { status: 500 });
  }
}