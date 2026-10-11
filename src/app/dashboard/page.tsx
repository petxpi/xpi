"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Obtener datos del usuario y mascotas
        const [userRes, petsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/pets")
        ]);

        if (!userRes.ok || !petsRes.ok) throw new Error("Error al cargar");

        const userData = await userRes.json();
        const petsData = await petsRes.json();

        setUser(userData);
        setPets(petsData.pets || []);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.name || "Usuario"}
          </p>
        </div>

        {/* Menú Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Mis Mascotas */}
          <Link href="/dashboard/pets" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-semibold text-gray-800">Mis Mascotas</h3>
            </div>
            <p className="text-sm text-gray-500">
              Gestiona tus mascotas y genera códigos QR
            </p>
            <p className="text-2xl font-bold text-purple-600 mt-3">
              {pets.length}
            </p>
          </Link>

          {/* Reportes Recibidos - NUEVO */}
          <Link href="/dashboard/reports" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📋</span>
              <h3 className="text-xl font-semibold text-gray-800">Reportes Recibidos</h3>
            </div>
            <p className="text-sm text-gray-500">
              Ver reportes de mascotas encontradas
            </p>
          </Link>

          {/* Configuración de Contacto */}
          <Link href="/profile/contact-settings" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚙️</span>
              <h3 className="text-xl font-semibold text-gray-800">Configuración</h3>
            </div>
            <p className="text-sm text-gray-500">
              Configura cómo quieres que te contacten
            </p>
          </Link>

          {/* Perfil */}
          <Link href="/profile" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👤</span>
              <h3 className="text-xl font-semibold text-gray-800">Mi Perfil</h3>
            </div>
            <p className="text-sm text-gray-500">
              Edita tu información personal
            </p>
          </Link>

          {/* Historial de Ubicación */}
          <Link href="/dashboard/location" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📍</span>
              <h3 className="text-xl font-semibold text-gray-800">Ubicación</h3>
            </div>
            <p className="text-sm text-gray-500">
              Historial de ubicaciones de tus mascotas
            </p>
          </Link>

          {/* Vacunas */}
          <Link href="/dashboard/vaccinations" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💉</span>
              <h3 className="text-xl font-semibold text-gray-800">Vacunas</h3>
            </div>
            <p className="text-sm text-gray-500">
              Registra y consulta vacunas de tus mascotas
            </p>
          </Link>
        </div>

        {/* Resumen Rápido */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen Rápido</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total de Mascotas</p>
              <p className="text-3xl font-bold text-purple-600">{pets.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">En Casa</p>
              <p className="text-3xl font-bold text-green-600">
                {pets.filter(p => p.status === 'home').length}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Perdidas</p>
              <p className="text-3xl font-bold text-red-600">
                {pets.filter(p => p.status === 'lost').length}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Mascotas Recientes */}
        {pets.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Mascotas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.slice(0, 3).map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-6xl">🐶</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                    <p className="text-sm text-gray-500">{pet.species} - {pet.breed || 'Sin raza'}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pet.status === 'home' ? 'bg-green-100 text-green-800' :
                        pet.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {pet.status === 'home' ? '🏠 En casa' :
                         pet.status === 'lost' ? '🚨 Perdida' :
                         '📍 En ruta'}
                      </span>
                      <Link href={`/pet/${pet.public_id}`} className="text-purple-600 hover:underline text-sm">
                        Ver QR →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {pets.length > 3 && (
              <div className="text-center mt-6">
                <Link href="/dashboard/pets" className="text-purple-600 hover:underline font-semibold">
                  Ver todas las mascotas →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}