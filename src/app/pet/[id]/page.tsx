"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PublicPetPage() {
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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

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
      let photoUrl = null;

      if (photo) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photo);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json();
          throw new Error("Error al subir la foto: " + errData.message);
        }

        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url;
      }

      const response = await fetch("/api/found-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          finderName: formData.finderName,
          finderEmail: formData.finderEmail,
          finderPhone: formData.finderPhone,
          description: formData.description,
          photoUrl,
          lat: null,
          lng: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess("✅ Reporte guardado exitosamente. El dueño será notificado.");
      setFormData({ finderName: "", finderEmail: "", finderPhone: "", description: "" });
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando información...</p>
      </div>
    );
  }

  if (error && !contactInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
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
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Header de Alerta */}
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold"> ¡{contactInfo?.petName} está PERDIDO!</p>
          <p className="text-sm">Si la ves, por favor contacta al dueño.</p>
        </div>

        {/* Foto de la Mascota - AHORA BIEN CENTRADA */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
          {contactInfo?.petPhotoUrl ? (
            <div className="w-full h-64 sm:h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={contactInfo.petPhotoUrl}
                alt={contactInfo.petName}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
              />
            </div>
          ) : (
            <div className="h-64 sm:h-80 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-8xl">🐶</span>
            </div>
          )}
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">{contactInfo?.petName}</h1>
            <p className="text-gray-500 mt-1">Ayúdala a volver a casa</p>
          </div>
        </div>

        {/* Botones de Contacto - SOLO si el dueño los autorizó */}
        {(contactInfo?.showWhatsApp || contactInfo?.showPhone || contactInfo?.showEmail) && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800"> Opciones de Contacto</h2>
            <div className="space-y-2">
              {contactInfo?.showWhatsApp && contactInfo?.ownerWhatsApp && (
                <button onClick={handleWhatsApp} className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                  <span>💬</span> Avisar por WhatsApp
                </button>
              )}
              {contactInfo?.showPhone && contactInfo?.ownerPhone && (
                <a href={`tel:${contactInfo.ownerPhone}`} className="block w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition text-center">
                  📞 Llamar al Dueño
                </a>
              )}
              {contactInfo?.showEmail && contactInfo?.ownerEmail && (
                <button onClick={handleEmail} className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2">
                  <span>✉️</span> Enviar Correo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Formulario de Reporte */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">📩 ¿La encontraste? Envía un reporte</h2>
          <p className="text-gray-600 mb-3 text-sm">
            Sube una foto y cuéntanos dónde la viste. El dueño recibirá tu mensaje.
          </p>

          {success && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sube una foto (Prueba de vida) 📸
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {photoPreview && (
                <div className="mt-2">
                  <img src={photoPreview} alt="Vista previa" className="w-full h-32 object-cover rounded" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre *</label>
              <input type="text" required value={formData.finderName} onChange={(e) => setFormData({ ...formData, finderName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Ej: Juan Pérez" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu email *</label>
              <input type="email" required value={formData.finderEmail} onChange={(e) => setFormData({ ...formData, finderEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="juan@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono (opcional)</label>
              <input type="tel" value={formData.finderPhone} onChange={(e) => setFormData({ ...formData, finderPhone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="300 123 4567" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Dónde encontraste a {contactInfo?.petName}? *</label>
              <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Ej: La encontré en el parque central..." />
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Enviando..." : "📤 Enviar Reporte al Dueño"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Protegido por <strong className="text-purple-600">XpiPet</strong> 🐾</p>
        </div>
      </div>
    </div>
  );
}