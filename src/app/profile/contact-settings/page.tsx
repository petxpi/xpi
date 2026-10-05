"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [settings, setSettings] = useState({
    phone: "",
    whatsapp: "",
    show_phone: false,
    show_whatsapp: false,
    show_email: true,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Aquí harías un fetch a tu API para obtener los settings actuales del usuario
        // Por ahora, usamos valores de ejemplo
        setSettings({
          phone: "",
          whatsapp: "",
          show_phone: false,
          show_whatsapp: false,
          show_email: true,
        });
      } catch (err) {
        setError("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Aquí harías un fetch a tu API para guardar los settings
      // const response = await fetch("/api/user/contact-settings", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(settings),
      // });
      
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("✅ Configuración guardada exitosamente");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="text-purple-600 hover:underline mb-2 inline-block">
            ← Volver al perfil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">️ Configuración de Contacto</h1>
          <p className="text-gray-600 mt-2">
            Elige qué información de contacto verá la persona que encuentre a tu mascota.
          </p>
        </div>

        {/* Formulario de Configuración */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Teléfono */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📞 Número de Teléfono
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="300 123 4567"
              />
              <label className="flex items-center mt-3 space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_phone}
                  onChange={(e) => setSettings({ ...settings, show_phone: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Mostrar botón de "Llamar" en mi perfil público
                </span>
              </label>
            </div>

            {/* WhatsApp */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 WhatsApp (con código de país)
              </label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="573001234567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ejemplo: 573001234567 (57 es el código de Colombia)
              </p>
              <label className="flex items-center mt-3 space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_whatsapp}
                  onChange={(e) => setSettings({ ...settings, show_whatsapp: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Mostrar botón de "WhatsApp" en mi perfil público
                </span>
              </label>
            </div>

            {/* Email */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_email}
                  onChange={(e) => setSettings({ ...settings, show_email: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  ✉️ Mostrar botón de "Enviar Correo" en mi perfil público
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2 ml-7">
                Se usará el email de tu cuenta
              </p>
            </div>
          </div>

          {/* Botón Guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "💾 Guardar Configuración"}
          </button>
        </div>

        {/* Información */}
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="font-semibold text-sm">💡 ¿Cómo funciona?</p>
          <p className="text-sm mt-1">
            Cuando alguien escanee el código QR de tu mascota, solo verá los botones de contacto que hayas activado aquí. 
            Tu privacidad está protegida.
          </p>
        </div>
      </div>
    </div>
  );
}