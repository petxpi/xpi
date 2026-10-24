import { NextRequest, NextResponse } from "next/server";

// Esta API recibe datos del collar GPS real
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { petId, lat, lng, speed, battery, status } = data;

    // Validación básica
    if (!petId || !lat || !lng) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // En producción: guardar en base de datos
    // await db.gpsLocations.create({ petId, lat, lng, speed, battery, status });

    console.log(`📍 GPS recibido - Mascota ${petId}: ${lat}, ${lng}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar datos GPS" },
      { status: 500 }
    );
  }
}

// GET: obtener última ubicación de una mascota
export async function GET(request: NextRequest) {
  const petId = request.nextUrl.searchParams.get("petId");
  
  if (!petId) {
    return NextResponse.json(
      { error: "petId requerido" },
      { status: 400 }
    );
  }

  // En producción: leer de base de datos
  return NextResponse.json({ 
    petId, 
    lat: 4.7110, 
    lng: -74.0721, 
    lastUpdate: new Date().toISOString() 
  });
}