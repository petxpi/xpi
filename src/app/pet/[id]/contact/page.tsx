"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ContactOwnerPage() {
  const params = useParams();
  const petId = params.id as string;

  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    finderName: "",
    finderEmail: "",
    finderPhone: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await fetch(`/api/pet-contact?petId=${petId}`);
        const data = await response.json();
        
        if (response.ok) {
          setContactInfo(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error al cargar información de contacto");
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, [petId]);

  async function handleWhatsApp() {
    if (!contactInfo?.ownerWhatsApp) {
      alert("El dueño no ha configurado WhatsApp");
      return;
    }

    const message = `Hola, encontré a tu mascota ${contactInfo.petName}. ${formData.description || 'Me gustaría darte más detalles.'}`;
    const whatsappUrl = `https://wa.me/${contactInfo.ownerWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  async function handleEmail() {
    if (!contactInfo?.ownerEmail) {
      alert("El dueño no ha configurado email");
      return;
    }

    const subject = `Encontré a tu mascota ${contactInfo.petName}`;
    const body = `Hola ${contactInfo.ownerName},\n\nEncontré a tu mascota ${contactInfo.petName}.\n\n${formData.description || 'Me gustaría darte más detalles.'}\n\nMi nombre es ${formData.finderName}\nMi email: ${formData.finderEmail}\nMi teléfono: ${formData.finderPhone}`;
    
    const emailUrl = `mailto:${contactInfo.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  }

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/found-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          finderName: formData.finderName,
          finderEmail: formData.finderEmail,
          finderPhone: formData.finderPhone,
          description: formData.description,
          photoUrl: null, // Aquí iría la URL de la foto si implementas subida
          lat: null, // Aquí iría la ubicación GPS si la implementas
          lng: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess("✅ Reporte guardado exitosamente. El dueño será notificado.");
      setFormData({ finderName: "", finderEmail: "", finderPhone: "", description: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando información...</p>
      </div>
    );
  }

  if (error && !contactInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📞 Contactar al Dueño</h1>
          <p className="text-gray-600">
            Ayuda a que <strong>{contactInfo?.petName}</strong> regrese a casa
          </p>
        </div>

        {/* Opciones de Contacto Rápido */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contacto Directo</h2>
          
          <div className="space-y-3">
            {contactInfo?.ownerWhatsApp && (
              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <span>📱</span> Enviar por WhatsApp
              </button>
            )}

            {contactInfo?.ownerEmail && (
              <button
                onClick={handleEmail}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <span>✉️</span> Enviar por Correo
              </button>
            )}

            {contactInfo?.ownerPhone && (
              <a
                href={`tel:${contactInfo.ownerPhone}`}
                className="block w-full bg-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-600 transition text-center"
              >
                📞 Llamar al Dueño
              </a>
            )}
          </div>
        </div>

        {/* Formulario de Reporte */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Guardar Reporte</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Si prefieres, puedes dejar un reporte. El dueño recibirá una notificación por correo.
          </p>

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre *
              </label>
              <input
                type="text"
                required
                value={formData.finderName}
                onChange={(e) => setFormData({ ...formData, finderName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu email *
              </label>
              <input
                type="email"
                required
                value={formData.finderEmail}
                onChange={(e) => setFormData({ ...formData, finderEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="juan@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu teléfono (opcional)
              </label>
              <input
                type="tel"
                value={formData.finderPhone}
                onChange={(e) => setFormData({ ...formData, finderPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="300 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Dónde encontraste a {contactInfo?.petName}? *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: La encontré en el parque de los deseos, cerca de la entrada principal. Se ve asustada pero bien de salud."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Guardando..." : "💾 Guardar Reporte"}
              </button>
              
              <Link
                href="/"
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Protegido por <strong className="text-purple-600">XpiPet</strong> 🐾</p>
        </div>
      </div>
    </div>
  );
}