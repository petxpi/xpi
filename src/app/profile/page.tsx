"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        // CORRECCIÓN: En lugar de leer document.cookie (que falla con HttpOnly),
        // hacemos un fetch al backend. El navegador envía la cookie automáticamente.
        const response = await fetch("/api/auth/me");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const userData = await response.json();
        setUser(userData.user);

        // Obtener mascotas del usuario
        const petsResponse = await fetch("/api/pets");
        if (petsResponse.ok) {
          const petsData = await petsResponse.json();
          setPets(petsData.pets || []);
        }
      } catch (err: any) {
        console.error("Error al cargar el perfil:", err);
        setError("Error al cargar el perfil. Por favor, inicia sesión nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // CORRECCIÓN: Mismo método de logout que el dashboard
  function handleLogout() {
    document.cookie = "auth-token=; path=/; max-age=0";
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold mb-2">Error</p>
          <p className="mb-4">{error}</p>
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Información del usuario */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="text-lg font-medium text-gray-900">{user?.name || "Sin nombre"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Correo electrónico</p>
              <p className="text-lg font-medium text-gray-900">{user?.email || "Sin email"}</p>
            </div>
          </div>

          {/* Enlace a configuración de contacto público */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/profile/contact-settings"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium hover:underline"
            >
              <span className="text-xl">⚙️</span>
              Configurar contacto público
            </Link>
            <p className="text-sm text-gray-500 mt-1 ml-8">
              Elige qué información verá quien encuentre a tu mascota
            </p>
          </div>
        </div>

        {/* Mis Mascotas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🐾 Mis Mascotas</h2>
            <Link
              href="/dashboard"
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
                href="/dashboard"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Ir al Dashboard para registrar
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navegación adicional */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 Navegación rápida</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block text-purple-600 hover:text-purple-800 hover:underline"
            >
              🏠 Ir al Dashboard
            </Link>
            <Link
              href="/profile/contact-settings"
              className="block text-purple-600 hover:text-purple-800 hover:underline"
            >
              ⚙️ Configurar contacto público
            </Link>
            <Link
              href="/"
              className="block text-purple-600 hover:text-purple-800 hover:underline"
            >
              🏡 Página principal
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