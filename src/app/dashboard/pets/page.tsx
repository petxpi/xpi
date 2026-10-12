"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Cropper from "react-easy-crop";

export default function DashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    color: "",
    sex: "",
    microchip: "",
    photo: "",
  });

  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropPetId, setCropPetId] = useState<string>("");

  useEffect(() => { loadPets(); }, []);

  useEffect(() => {
    if (cropImage && !croppedAreaPixels) {
      setCroppedAreaPixels({ x: 0, y: 0, width: 100, height: 100 });
    }
  }, [cropImage, croppedAreaPixels]);

  async function loadPets() {
    try {
      const response = await fetch("/api/pets");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar mascotas");
      setPets(data.pets || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => { if (blob) resolve(blob); }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>, petId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setShowCropModal(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
      if (petId) setCropPetId(petId);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropSave() {
    if (!cropImage || !croppedAreaPixels) {
      alert("Error: No se pudo procesar la imagen.");
      return;
    }
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const formDataUpload = new FormData();
      formDataUpload.append("file", croppedBlob, "cropped-image.jpg");

      const res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // ✅ FIX CLAVE: Actualizar formData inmediatamente para que se muestre en el modal
      setFormData(prev => ({ ...prev, photo: data.url }));

      if (cropPetId) {
        const updateRes = await fetch(`/api/pets/${cropPetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name || "Sin nombre",
            species: formData.species || "dog",
            breed: formData.breed || null,
            color: formData.color || null,
            sex: formData.sex || null,
            microchip: formData.microchip || null,
            photo: data.url,
          }),
        });
        if (!updateRes.ok) throw new Error("Error al actualizar");
        await loadPets();
      }

      setShowCropModal(false);
      setCropImage("");
      setCroppedAreaPixels(null);
    } catch (err: any) {
      alert("Error al subir foto: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  function openEditModal(pet: any) {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      color: pet.color || "",
      sex: pet.sex || "",
      microchip: pet.microchip || "",
      photo: pet.photo_url || "",
    });
  }

  function closeEditModal() {
    setEditingPet(null);
    setFormData({ name: "", species: "", breed: "", color: "", sex: "", microchip: "", photo: "" });
  }

  async function handleUpdatePet(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPet) return;
    try {
      const response = await fetch(`/api/pets/${editingPet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Error al actualizar");
      alert("✅ Mascota actualizada!");
      closeEditModal();
      loadPets();
    } catch (err: any) { setError(err.message); }
  }

  function handleLogout() {
    document.cookie = "auth-token=; path=/; max-age=0";
    router.push("/login");
  }

  const speciesEmoji: Record<string, string> = { dog: "", cat: "🐱", bird: "🐦", rabbit: "", other: "🐾" };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">🐾 XpiPet Dashboard</h1>
          <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Cerrar Sesión</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Mis Mascotas</h2>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Cargando...</p>
        ) : pets.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No tienes mascotas registradas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet: any) => (
              <div key={pet.id} className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {speciesEmoji[pet.species] || "🐾"} {pet.name}
                </h3>
                
                <div className="mb-4 flex justify-center">
                  {pet.photo_url ? (
                    <div className="w-32 h-32 rounded-full border-4 border-purple-100 shadow-md overflow-hidden">
                      <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                      {speciesEmoji[pet.species] || ""}
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>🐾 Especie: {pet.species}</p>
                  {pet.breed && <p>🦴 Raza: {pet.breed}</p>}
                  {pet.color && <p>🎨 Color: {pet.color}</p>}
                  {pet.sex && <p>⚧ Sexo: {pet.sex}</p>}
                </div>

                {/* ✅ BOTONES RESTAURADOS */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <a href={`/pets/${pet.public_id}`} target="_blank" className="flex-1 bg-pink-600 text-white text-sm py-2 rounded hover:bg-pink-700 text-center">👁️ Ver Perfil</a>
                    <button onClick={() => alert("QR: " + pet.public_id)} className="flex-1 bg-purple-600 text-white text-sm py-2 rounded hover:bg-purple-700"> Ver QR</button>
                  </div>
                  <button onClick={() => openEditModal(pet)} className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700">✏️ Editar</button>
                  <button className="w-full bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700">📍 Ubicación</button>
                  <button className="w-full bg-indigo-600 text-white text-sm py-2 rounded hover:bg-indigo-700"> Historial</button>
                  <button className="w-full bg-teal-600 text-white text-sm py-2 rounded hover:bg-teal-700">💉 Vacunas</button>
                  <button className="w-full bg-red-100 text-red-600 text-sm py-2 rounded hover:bg-red-200">🗑️ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Crop */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center"> Ajusta la foto</h3>
            <div className="relative w-full h-80 mb-6 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCropSave} disabled={uploading} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400">
                {uploading ? "Subiendo..." : "✅ Guardar"}
              </button>
              <button onClick={() => { setShowCropModal(false); setCropImage(""); }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">✏️ Editar {editingPet.name}</h3>
            <form onSubmit={handleUpdatePet} className="space-y-4">
              
              {/* Sección de foto */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-dashed border-blue-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">📷 Foto</label>
                
                {/* ✅ FIX: Mostrar la foto actualizada inmediatamente */}
                {formData.photo ? (
                  <div className="mb-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-300 overflow-hidden shadow-lg">
                      <img src={formData.photo} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Foto actual</p>
                      <p className="text-xs text-gray-500">Sube una nueva para cambiarla</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-3xl">
                      {speciesEmoji[formData.species] || ""}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Sin foto</p>
                      <p className="text-xs text-gray-500">Selecciona una imagen</p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e, editingPet.id)}
                  disabled={uploading}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                  <select required value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="dog"> Perro</option>
                    <option value="cat">🐱 Gato</option>
                    <option value="bird">🐦 Ave</option>
                    <option value="rabbit">🐰 Conejo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                  <input type="text" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="">Seleccionar...</option>
                    <option value="male">Macho</option>
                    <option value="female">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Microchip</label>
                  <input type="text" value={formData.microchip} onChange={(e) => setFormData({ ...formData, microchip: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"> Guardar</button>
                <button type="button" onClick={closeEditModal} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}