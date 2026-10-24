"use client";

interface LiveMapProps {
  center: [number, number];
  zoom?: number;
  petLocation?: { lat: number; lng: number; name: string; status?: string } | null;
  geoFence?: { lat: number; lng: number; radius: number } | null;
  className?: string;
}

export default function LiveMap({
  center,
  zoom = 16,
  petLocation,
  geoFence,
  className = "h-[600px] w-full",
}: LiveMapProps) {
  const [lat, lng] = center;
  const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className={`relative ${className}`}>
      <iframe
        src={mapUrl}
        className="w-full h-full border-0"
        title="Mapa de ubicación"
        allowFullScreen
      />
      {petLocation && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <div>
              <p className="font-bold text-purple-700">{petLocation.name}</p>
              <p className="text-xs text-gray-600">
                {petLocation.status === "lost" ? "🚨 PERDIDO" : petLocation.status === "moving" ? "🏃 En movimiento" : "🏠 En casa"}
              </p>
            </div>
          </div>
        </div>
      )}
      {geoFence && (
        <div className="absolute bottom-4 left-4 bg-purple-100 border-2 border-purple-400 rounded-lg p-3 z-10">
          <p className="text-sm font-bold text-purple-700">🛡️ Zona Segura</p>
          <p className="text-xs text-purple-600">Radio: {geoFence.radius}m</p>
        </div>
      )}
    </div>
  );
}