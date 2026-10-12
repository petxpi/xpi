"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function PetPublicProfile() {
  const params = useParams();
  const publicId = params.publicId as string;

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({ name: "", email: "", message: "", phone: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [contactSent, setContactSent] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPet();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [publicId]);

  async function loadPet() {
    try {
      const response = await fetch(`/api/pet-contact?petId=${publicId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Mascota no encontrada");
      setPet(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openCamera() {
    setCameraError("");
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", 0.8));
    setPhotoFileName(`foto-${Date.now()}.jpg`);
    closeCamera();
  }

  function closeCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setPhotoFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  function buildMessage(): string {
    let msg = ` *¡HOLA! Encontré a ${pet.petName}*\n\n`;
    msg += ` *Información del reporte:*\n`;
    msg += `👤 Nombre: ${contactData.name}\n`;
    msg += `📞 Teléfono: ${contactData.phone || "No proporcionado"}\n`;
    msg += `📧 Email: ${contactData.email}\n`;
    msg += `📍 Ubicación/Mensaje: ${contactData.message}\n\n`;
    if (photo) msg += `📩 *Foto adjunta:* (Verifica que se haya adjuntado la imagen)\n\n`;
    msg += `Por favor contáctame para coordinar la entrega. ¡Gracias!`;
    return msg;
  }

  function sendViaWhatsApp() {
    if (!contactData.name || !contactData.email || !contactData.message) {
      alert("⚠️ Por favor completa al menos nombre, email y mensaje.");
      return;
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(buildMessage())}`;
    window.open(whatsappUrl, "_blank");
    if (photo) setTimeout(() => alert("📩 No olvides adjuntar la foto manualmente en WhatsApp."), 1000);
  }

  function sendViaEmail() {
    if (!contactData.name || !contactData.email || !contactData.message) {
      alert("⚠️ Por favor completa al menos nombre, email y mensaje.");
      return;
    }
    let body = `¡HOLA!\n\nEncontré a ${pet.petName} y quiero ayudarte.\n\n`;
    body += ` INFORMACIÓN DEL REPORTE:\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `👤 Nombre: ${contactData.name}\n📞 Teléfono: ${contactData.phone || "No proporcionado"}\n📧 Email: ${contactData.email}\n📍 Ubicación/Mensaje: ${contactData.message}\n\n`;
    if (photo) body += `📩 FOTO: (Adjunta manualmente en este correo)\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPor favor contáctame para coordinar la entrega.\n\n---\nReporte generado por XpiPet\nCódigo: ${pet.publicId}\n`;
    
    window.location.href = `mailto:${contactData.email}?subject=${encodeURIComponent(`🐾 ¡Encontré a ${pet.petName}! - XpiPet`)}&body=${encodeURIComponent(body)}`;
    if (photo) setTimeout(() => alert("📩 No olvides adjuntar la foto manualmente en tu correo."), 1000);
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setShowContactForm(false);
      setContactSent(false);
      setContactData({ name: "", email: "", message: "", phone: "" });
      setPhoto(null);
      setPhotoFileName("");
    }, 5000);
  }

  const speciesEmoji: Record<string, string> = { dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾" };
  const speciesNames: Record<string, string> = { dog: "Perro", cat: "Gato", bird: "Ave", rabbit: "Conejo", other: "Otro" };
  const sexNames: Record<string, string> = { male: "Macho", female: "Hembra" };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center"><p className="text-purple-600 font-semibold">Cargando perfil...</p></div>;
  if (error || !pet) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mascota no encontrada</h2>
        <a href="/" className="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold">← Volver al inicio</a>
      </div>
    </div>
  );

  const isLost = pet.petStatus === "lost";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-purple-600 flex items-center gap-2">← XpiPet</a>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isLost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {isLost ? "🚨 PERDIDO" : "🏠 En casa"}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {isLost && pet.lostReport && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🚨</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-700 mb-2">¡{pet.petName} está PERDIDO!</h2>
                <p className="text-red-600 mb-3">{pet.lostReport}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center relative">
            {pet.petPhotoUrl ? (
              <div className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img src={pet.petPhotoUrl} alt={pet.petName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-8xl mb-2">{speciesEmoji[pet.species] || "🐾"}</div>
            )}
            <h1 className="text-4xl font-bold text-white mb-2">{pet.petName}</h1>
            <p className="text-purple-100">{speciesNames[pet.species] || pet.species}{pet.breed && ` • ${pet.breed}`}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">🐾 Información</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Especie</span><span className="font-semibold text-gray-800">{speciesNames[pet.species] || pet.species}</span></div>
                  {pet.breed && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Raza</span><span className="font-semibold text-gray-800">{pet.breed}</span></div>}
                  {pet.color && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Color</span><span className="font-semibold text-gray-800">{pet.color}</span></div>}
                  {pet.sex && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Sexo</span><span className="font-semibold text-gray-800">{sexNames[pet.sex] || pet.sex}</span></div>}
                  {pet.microchip && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Microchip</span><span className="font-semibold text-gray-800 font-mono">{pet.microchip}</span></div>}
                  <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Código</span><span className="font-semibold text-purple-600 font-mono">{pet.publicId}</span></div>
                  <div className="flex justify-between py-2"><span className="text-gray-600">Registrado</span><span className="font-semibold text-gray-800">{new Date(pet.createdAt).toLocaleDateString("es-CO")}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📞 Contacto Directo</h3>
                <div className="space-y-3 mb-6">
                  {pet.showPhone && pet.ownerPhone && (
                    <a href={`tel:${pet.ownerPhone}`} className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">📞 Llamar: {pet.ownerPhone}</a>
                  )}
                  {pet.showWhatsApp && pet.ownerWhatsApp && (
                    <a href={`https://wa.me/${pet.ownerWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, encontré a ${pet.petName}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">💬 WhatsApp</a>
                  )}
                  {pet.showEmail && pet.ownerEmail && (
                    <a href={`mailto:${pet.ownerEmail}?subject=${encodeURIComponent(`Encontré a ${pet.petName}`)}&body=${encodeURIComponent(`Hola, encontré a tu mascota ${pet.petName}.`)}`} className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">✉️ Enviar Correo</a>
                  )}
                  {!pet.showPhone && !pet.showWhatsApp && !pet.showEmail && (
                    <p className="text-sm text-gray-500 text-center italic bg-gray-50 p-3 rounded-lg">El dueño prefiere que uses el formulario de reporte.</p>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📱 Código QR</h3>
                <div className="bg-gray-50 p-6 rounded-xl flex justify-center mb-6">
                  <QRCodeSVG value={`${typeof window !== "undefined" ? window.location.origin : ""}/pets/${pet.publicId}`} size={200} level="H" includeMargin={true} />
                </div>
                
                <button onClick={() => { setShowContactForm(true); setContactSent(false); setPhoto(null); setPhotoFileName(""); }} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 mb-4 flex items-center justify-center gap-2">📝 Enviar Reporte con Foto</button>

                {pet.lastLocation && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">📍 Última ubicación</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700"><strong>Coordenadas:</strong><br />Lat: {pet.lastLocation.lat.toFixed(6)}<br />Lng: {pet.lastLocation.lng.toFixed(6)}</p>
                      <p className="text-xs text-gray-500 mt-2">Actualizado: {new Date(pet.lastLocation.updatedAt).toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 py-4">
          <p>🔒 Protegido por <strong className="text-purple-600">XpiPet</strong></p>
        </div>
      </main>

      {/* Modal de Cámara (sin cambios funcionales, solo estructura) */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-2xl w-full">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">📸 Tomar foto de {pet.petName}</h3>
            </div>
            {cameraError ? (
              <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
                <p className="text-red-300 mb-4">{cameraError}</p>
                <button onClick={closeCamera} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600">Cerrar</button>
              </div>
            ) : (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto max-h-96 object-cover" />
                  <div className="absolute inset-0 border-2 border-white border-opacity-30 pointer-events-none"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3">
                  <button onClick={capturePhoto} className="flex-1 bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 font-bold text-lg">📩 Capturar foto</button>
                  <button onClick={closeCamera} className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-600 font-semibold">Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Contacto */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[95vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">📩</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Contactar al dueño</h3>
              <p className="text-sm text-gray-600">Ayuda a que <strong>{pet.petName}</strong> regrese a casa</p>
            </div>

            {contactSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-5xl mb-2">✅</div>
                <p className="text-green-700 font-semibold text-lg mb-2">¡Gracias por tu ayuda!</p>
                <button onClick={() => setShowContactForm(false)} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <label className="block text-sm font-bold text-indigo-900 mb-3">📩 Foto de {pet.petName} (opcional)</label>
                  <input type="file" ref={galleryInputRef} accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button type="button" onClick={openCamera} className="bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 font-semibold text-sm">📸 Tomar foto</button>
                    <button type="button" onClick={() => galleryInputRef.current?.click()} className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 font-semibold text-sm">🖼️ Subir foto</button>
                  </div>
                  {photo && (
                    <div className="relative mt-3">
                      <img src={photo} alt="Foto" className="w-full h-48 object-cover rounded-lg border-2 border-indigo-200" />
                      <button type="button" onClick={() => { setPhoto(null); setPhotoFileName(""); }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 font-bold">✖</button>
                      <p className="text-xs text-indigo-700 mt-2 text-center">📎 {photoFileName}</p>
                    </div>
                  )}
                </div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre *</label><input type="text" required value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Ej: Juan Pérez" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tu email *</label><input type="email" required value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="juan@email.com" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono</label><input type="tel" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="300 123 4567" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">¿Dónde encontraste a {pet.petName}? *</label><textarea required rows={3} value={contactData.message} onChange={(e) => setContactData({ ...contactData, message: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Ej: La encontré en el parque..." /></div>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <button type="button" onClick={sendViaWhatsApp} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2">📱 Enviar por WhatsApp</button>
                  <button type="button" onClick={sendViaEmail} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">📧 Enviar por correo</button>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold">💾 Guardar reporte</button>
                    <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}