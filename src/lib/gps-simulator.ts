// Simula datos GPS en tiempo real

export interface GPSData {
  petId: string;
  petName: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  status: "home" | "lost" | "moving";
  lastUpdate: string;
  address?: string;
}

// Base de datos simulada - usa CUALQUIER ID
const petsGPS: Map<string, GPSData> = new Map();

// Función para obtener o crear datos GPS para cualquier mascota
export function getOrCreatePetGPS(petId: string, petName: string = "Mascota"): GPSData {
  if (!petsGPS.has(petId)) {
    petsGPS.set(petId, {
      petId,
      petName,
      lat: 4.7110 + (Math.random() - 0.5) * 0.01,
      lng: -74.0721 + (Math.random() - 0.5) * 0.01,
      speed: 0,
      battery: 80 + Math.random() * 20,
      status: "home",
      lastUpdate: new Date().toISOString(),
    });
  }
  return petsGPS.get(petId)!;
}

// Simula movimiento aleatorio
export function simulateMovement(petId: string, petName: string = "Mascota"): GPSData {
  const pet = getOrCreatePetGPS(petId, petName);

  const deltaLat = (Math.random() - 0.5) * 0.0005;
  const deltaLng = (Math.random() - 0.5) * 0.0005;

  pet.lat += deltaLat;
  pet.lng += deltaLng;
  pet.speed = Math.random() * 8;
  pet.battery = Math.max(10, pet.battery - 0.01);
  pet.lastUpdate = new Date().toISOString();

  return { ...pet };
}

export function getAllPetsGPS(): GPSData[] {
  // Si está vacío, crear algunos pets de ejemplo
  if (petsGPS.size === 0) {
    getOrCreatePetGPS("demo-1", "Marsella");
    getOrCreatePetGPS("demo-2", "Pinino");
    getOrCreatePetGPS("demo-3", "Caturro");
  }
  return Array.from(petsGPS.values());
}

export function getPetGPS(petId: string): GPSData | null {
  return petsGPS.get(petId) || null;
}