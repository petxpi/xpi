"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

//  FORZAR renderizado dinámico (evita error en build)
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth-token="))
          ?.split("=")[1];

        if (!token) {
          router.push("/login");
          return;
        }

        const userResponse = await fetch("/api/auth/me", {
          headers: { Cookie: `auth-token=${token}` },
        });

        if (!userResponse.ok) {
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        const petsResponse = await fetch("/api/pets", {
          headers: { Cookie: `auth-token=${token}` },
        });

        if (petsResponse.ok) {
          const petsData = await petsResponse.json();
          setPets(petsData.pets || []);
        }
      } catch (err) {
        setError("Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <Link href="/login" className="text-blue-600 hover:underline mt-2 inline-block">
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🏠 Dashboard</h1>
            <Link
              href="/profile"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Mi Perfil →
            </Link>
          </div>
          <p className="text-gray-600">
            Bienvenido, <strong>{user?.name || "Usuario"}</strong>
          </p>
        </div>

        {/* Mis Mascotas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🐾 Mis Mascotas</h2>
            <Link
              href="/pets/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
            >
              + Agregar mascota
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-6xl mb-4">🐶</p>
              <p className="text-gray-600 mb-4">Aún no tienes mascotas registradas</p>
              <Link
                href="/pets/new"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Registrar mi primera mascota
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pet/${pet.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-500">
                        {pet.species || "Mascota"} • {pet.breed || "Raza no especificada"}
                      </p>
                      {pet.status === "lost" && (
                        <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                          🚨 PERDIDO
                        </span>
                      )}
                      {pet.status === "home" && (
                        <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                          ✅ En casa
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Navegación rápida */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4"> Navegación rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/profile"
              className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition"
            >
              <p className="font-semibold text-gray-900">👤 Mi Perfil</p>
              <p className="text-sm text-gray-500">Editar información personal</p>
            </Link>
            <Link
              href="/profile/contact-settings"
              className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition"
            >
              <p className="font-semibold text-gray-900">️ Contacto Público</p>
              <p className="text-sm text-gray-500">Configurar privacidad</p>
            </Link>
            <Link
              href="/pets/new"
              className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition"
            >
              <p className="font-semibold text-gray-900">➕ Nueva Mascota</p>
              <p className="text-sm text-gray-500">Registrar una mascota</p>
            </Link>
            <Link
              href="/"
              className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition"
            >
              <p className="font-semibold text-gray-900">🏡 Página Principal</p>
              <p className="text-sm text-gray-500">Ir al inicio</p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Protegido por <strong className="text-purple-600">XpiPet</strong> 🐾
          </p>
        </div>
      </div>
    </div>
  );
}