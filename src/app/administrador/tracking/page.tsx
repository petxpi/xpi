"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LiveMap from "@/components/LiveMap";

export default function AdminTrackingPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "home" | "moving" | "lost">("all");
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, home: 0, moving: 0, lost: 0 });

  useEffect(() => {
    async function fetchAllGPS() {
      try {
        const res = await fetch("/api/gps/live?all=true");
        const data = await res.json();
        if (data.pets) {
          setPets(data.pets);
          setStats({
            total: data.pets.length,
            home: data.pets.filter((p: any) => p.status === "home").length,
            moving: data.pets.filter((p: any) => p.status === "moving").length,
            lost: data.pets.filter((p: any) => p.status === "lost").length,
          });
          if (!selectedPet && data.pets.length > 0) {
            setSelectedPet(data.pets[0]);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllGPS();
    const interval = setInterval(fetchAllGPS, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredPets = filter === "all" ? pets : pets.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Cargando mapa global...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      <header className="bg-black bg-opacity-50 backdrop-blur-md border-b border-purple-500 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white">
              ‍💼 Panel de Control GPS - Global
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm font-semibold">EN VIVO</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-md border border-purple-400 rounded-xl p-4">
            <p className="text-purple-200 text-sm">Total Rastreados</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-green-500 bg-opacity-20 backdrop-blur-md border border-green-400 rounded-xl p-4">
            <p className="text-green-200 text-sm">🏠 En Casa</p>
            <p className="text-3xl font-bold text-green-400">{stats.home}</p>
          </div>
          <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-md border border-yellow-400 rounded-xl p-4">
            <p className="text-yellow-200 text-sm"> En Movimiento</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.moving}</p>
          </div>
          <div className="bg-red-500 bg-opacity-20 backdrop-blur-md border border-red-400 rounded-xl p-4">
            <p className="text-red-200 text-sm">🚨 Perdidos</p>
            <p className="text-3xl font-bold text-red-400">{stats.lost}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-10 backdrop-blur-md border border-purple-400 rounded-xl p-4">
              <h3 className="font-bold text-white mb-4">🐾 Mascotas Activas</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(["all", "home", "moving", "lost"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      filter === f
                        ? "bg-purple-600 text-white"
                        : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                    }`}
                  >
                    {f === "all" ? "Todas" : f === "home" ? "🏠 Casa" : f === "moving" ? "🏃 Movimiento" : "🚨 Perdidos"}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredPets.map((pet) => (
                  <button
                    key={pet.petId}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedPet?.petId === pet.petId
                        ? "bg-purple-600 text-white"
                        : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{pet.petName}</p>
                        <p className="text-xs opacity-70">
                          {pet.lat.toFixed(4)}, {pet.lng.toFixed(4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">
                          {pet.status === "lost" ? "🚨" : pet.status === "moving" ? "🏃" : "🏠"}
                        </p>
                        <p className="text-xs opacity-70">{Math.round(pet.battery)}%</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-10 backdrop-blur-md border border-purple-400 rounded-xl p-4">
              <h3 className="font-bold text-white mb-4">
                🗺️ Mapa Global {selectedPet && `- ${selectedPet.petName}`}
              </h3>
              <div className="rounded-lg overflow-hidden">
                {selectedPet ? (
                  <LiveMap
                    center={[selectedPet.lat, selectedPet.lng]}
                    zoom={16}
                    petLocation={{
                      lat: selectedPet.lat,
                      lng: selectedPet.lng,
                      name: selectedPet.petName,
                      status: selectedPet.status,
                    }}
                    className="h-[500px] w-full"
                  />
                ) : (
                  <div className="h-[500px] w-full bg-gray-800 flex items-center justify-center text-white">
                    Selecciona una mascota
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}