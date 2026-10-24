import { NextRequest, NextResponse } from "next/server";
import { getPetGPS, getAllPetsGPS, simulateMovement, getOrCreatePetGPS } from "@/lib/gps-simulator";

export async function GET(request: NextRequest) {
  const petId = request.nextUrl.searchParams.get("petId");
  const petName = request.nextUrl.searchParams.get("petName") || "Mascota";
  const all = request.nextUrl.searchParams.get("all");

  try {
    if (all === "true") {
      const pets = getAllPetsGPS();
      return NextResponse.json({ pets });
    }

    if (petId) {
      // Usar simulateMovement que ahora crea el pet si no existe
      const data = simulateMovement(petId, petName);
      return NextResponse.json({ pet: data });
    }

    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}