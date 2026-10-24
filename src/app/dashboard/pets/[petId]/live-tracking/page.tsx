"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LiveTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.petId as string;

  const [gpsData, setGpsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [panicMode, setPanicMode] = useState(false);
  const [geoFence, setGeoFence] = useState<{ lat: number; lng: number; radius: number } | null>(null);
  const [geoFenceRadius, setGeoFenceRadius] = useState(500);

  useEffect(() => {
    async function fetchGPS() {
      try {
        const res = await fetch(`/api/gps/live?petId=${petId}&petName=Mascota`);
        const data = await res.json();
        if (data.pet) {
          setGpsData(data.pet);
          if (!geoFence) {
            setGeoFence({ lat: data.pet.lat, lng: data.pet.lng, radius: geoFenceRadius });
          }
        }
      } catch (error) {
        console.error("Error GPS:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGPS();
    const interval = setInterval(fetchGPS, panicMode ? 2000 : 5000);
    return () => clearInterval(interval);
  }, [petId, panicMode]);

  const handleActivatePanic = () => {
    setPanicMode(!panicMode);
    alert(panicMode ? "✅ Modo pánico desactivado" : "🚨 MODO PÁNICO ACTIVADO");
  };

  const handleSetGeoFence = () => {
    if (gpsData) {
      setGeoFence({ lat: gpsData.lat, lng: gpsData.lng, radius: geoFenceRadius });
      alert(`✅ Geocerca activada: ${geoFenceRadius}m`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Conectando con GPS...</p>
        </div>
      </div>
    );
  }

  // Calcular URL del mapa
  const [lat, lng] = gpsData ? [gpsData.lat, gpsData.lng] : [4.7110, -74.0721];
  const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")} 
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 font-semibold"
            >
              ← Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-purple-700">
              🛰️ Rastreo en Vivo: {gpsData?.petName || "Mascota"}
            </h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            gpsData?.status === "lost" ? "bg-red-100 text-red-700" 
            : gpsData?.status === "moving" ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
          }`}>
            {gpsData?.status === "lost" ? "🚨 PERDIDO" : gpsData?.status === "moving" ? " En movimiento" : "🏠 En casa"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* GPS Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4"> Estado del GPS</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Batería</span>
                    <span className="font-bold text-green-600">{Math.round(gpsData?.battery || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${gpsData?.battery || 0}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Velocidad</span>
                  <span className="font-bold text-purple-700">{(gpsData?.speed || 0).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última actualización</span>
                  <span className="text-xs text-gray-500">
                    {gpsData?.lastUpdate ? new Date(gpsData.lastUpdate).toLocaleTimeString() : "--:--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Panic Mode */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">🚨 Modo Pánico</h3>
              <p className="text-sm text-gray-600 mb-4">Reportes cada 2 segundos</p>
              <button 
                onClick={handleActivatePanic} 
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  panicMode ? "bg-red-600 text-white animate-pulse" : "bg-gray-200 text-gray-700 hover:bg-red-100"
                }`}
              >
                {panicMode ? "🚨 PÁNICO ACTIVO" : "Activar Pánico"}
              </button>
            </div>

            {/* GeoFence */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">🛡️ Zona Segura</h3>
              <label className="block text-sm text-gray-600 mb-2">Radio (metros)</label>
              <input 
                type="range" 
                min="100" 
                max="2000" 
                step="100" 
                value={geoFenceRadius} 
                onChange={(e) => setGeoFenceRadius(Number(e.target.value))} 
                className="w-full mb-2"
              />
              <p className="text-center text-sm font-bold text-purple-700 mb-4">{geoFenceRadius} metros</p>
              <button 
                onClick={handleSetGeoFence} 
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold"
              >
                Activar Geocerca
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden relative h-[600px]">
              <iframe 
                src={mapUrl} 
                className="w-full h-full border-0" 
                title="Mapa de ubicación"
                allowFullScreen
              />
              {gpsData && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐾</span>
                    <div>
                      <p className="font-bold text-purple-700">{gpsData.petName}</p>
                      <p className="text-xs text-gray-600">
                        {gpsData.status === "lost" ? "🚨 PERDIDO" : gpsData.status === "moving" ? "🏃 En movimiento" : "🏠 En casa"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coordinates */}
            {gpsData && (
              <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Latitud</p>
                    <p className="font-mono font-bold text-purple-700">{gpsData.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Longitud</p>
                    <p className="font-mono font-bold text-purple-700">{gpsData.lng.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Precisión</p>
                    <p className="font-bold text-green-600">± 5 metros</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Modo</p>
                    <p className={`font-bold ${panicMode ? "text-red-600" : "text-gray-700"}`}>
                      {panicMode ? "🚨 Pánico" : "Normal"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}