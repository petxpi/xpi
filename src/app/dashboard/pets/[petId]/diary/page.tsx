"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DiaryPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.petId as string;

  const [pet, setPet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "milestones" | "documents">("gallery");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Galería
  const [photos, setPhotos] = useState<any[]>([]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [photoForm, setPhotoForm] = useState({ category: "other", caption: "", takenAt: "" });
  const [photoFile, setPhotoFile] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Hitos
  const [milestones, setMilestones] = useState<any[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", milestoneDate: "", category: "other", photoUrl: "" });
  const [milestoneFile, setMilestoneFile] = useState<string>("");
  const [uploadingMilestone, setUploadingMilestone] = useState(false);

  // Documentos
  const [documents, setDocuments] = useState<any[]>([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [documentForm, setDocumentForm] = useState({ documentType: "other", documentName: "", issueDate: "", expiryDate: "" });
  const [documentFile, setDocumentFile] = useState<string>("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPet();
    loadPhotos();
    loadMilestones();
    loadDocuments();
  }, [petId]);

  async function loadPet() {
    try {
      const response = await fetch("/api/pets");
      const data = await response.json();
      const found = (data.pets || []).find((p: any) => p.id === petId);
      setPet(found);
    } catch (err) {
      setError("Error al cargar mascota");
    } finally {
      setLoading(false);
    }
  }

  async function loadPhotos() {
    try {
      const response = await fetch(`/api/pet-gallery?petId=${petId}`);
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error("Error al cargar galería:", err);
    }
  }

  async function loadMilestones() {
    try {
      const response = await fetch(`/api/pet-milestones?petId=${petId}`);
      const data = await response.json();
      setMilestones(data.milestones || []);
    } catch (err) {
      console.error("Error al cargar hitos:", err);
    }
  }

  async function loadDocuments() {
    try {
      const response = await fetch(`/api/pet-documents?petId=${petId}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Error al cargar documentos:", err);
    }
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.url;
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>, target: "photo" | "milestone" | "document") {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (target === "photo") setPhotoFile(reader.result as string);
      else if (target === "milestone") setMilestoneFile(reader.result as string);
      else setDocumentFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!photoFile) { alert("Seleccioná una foto"); return; }
    try {
      setUploadingPhoto(true);
      const file = await (await fetch(photoFile)).blob();
      const url = await uploadToCloudinary(new File([file], "photo.jpg", { type: "image/jpeg" }));
      await fetch("/api/pet-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          photoUrl: url,
          category: photoForm.category,
          caption: photoForm.caption,
          takenAt: photoForm.takenAt || null,
        }),
      });
      setShowAddPhoto(false);
      setPhotoForm({ category: "other", caption: "", takenAt: "" });
      setPhotoFile("");
      await loadPhotos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!milestoneForm.title || !milestoneForm.milestoneDate) { alert("Completá título y fecha"); return; }
    try {
      setUploadingMilestone(true);
      let photoUrl = null;
      if (milestoneFile) {
        const file = await (await fetch(milestoneFile)).blob();
        photoUrl = await uploadToCloudinary(new File([file], "milestone.jpg", { type: "image/jpeg" }));
      }
      await fetch("/api/pet-milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          title: milestoneForm.title,
          description: milestoneForm.description,
          milestoneDate: milestoneForm.milestoneDate,
          category: milestoneForm.category,
          photoUrl,
        }),
      });
      setShowAddMilestone(false);
      setMilestoneForm({ title: "", description: "", milestoneDate: "", category: "other", photoUrl: "" });
      setMilestoneFile("");
      await loadMilestones();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUploadingMilestone(false);
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!documentFile) { alert("Seleccioná un documento"); return; }
    try {
      setUploadingDocument(true);
      const file = await (await fetch(documentFile)).blob();
      const url = await uploadToCloudinary(new File([file], "document.pdf", { type: "application/pdf" }));
      await fetch("/api/pet-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          documentUrl: url,
          documentType: documentForm.documentType,
          documentName: documentForm.documentName,
          issueDate: documentForm.issueDate || null,
          expiryDate: documentForm.expiryDate || null,
        }),
      });
      setShowAddDocument(false);
      setDocumentForm({ documentType: "other", documentName: "", issueDate: "", expiryDate: "" });
      setDocumentFile("");
      await loadDocuments();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUploadingDocument(false);
    }
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("¿Eliminar esta foto?")) return;
    try {
      await fetch("/api/pet-gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, petId }),
      });
      await loadPhotos();
    } catch (err) { alert("Error al eliminar"); }
  }

  async function deleteMilestone(milestoneId: string) {
    if (!confirm("¿Eliminar este hito?")) return;
    try {
      await fetch("/api/pet-milestones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, petId }),
      });
      await loadMilestones();
    } catch (err) { alert("Error al eliminar"); }
  }

  async function deleteDocument(documentId: string) {
    if (!confirm("¿Eliminar este documento?")) return;
    try {
      await fetch("/api/pet-documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, petId }),
      });
      await loadDocuments();
    } catch (err) { alert("Error al eliminar"); }
  }

  const categoryLabels: Record<string, string> = {
    puppy: "🐶 Cachorro",
    birthday: "🎂 Cumpleaños",
    family: "👨‍👩‍👧 Familia",
    holiday: "🏖️ Vacaciones",
    trick: "🎓 Trucos",
    adoption: "🏠 Adopción",
    achievement: "🏆 Logros",
    first: "🥇 Primeras veces",
    medical: "💉 Médico",
    other: "📷 Otro",
  };

  const documentTypeLabels: Record<string, string> = {
    pedigree: "🏆 Pedigree",
    vaccine_cert: "💉 Certificado de Vacunación",
    microchip: "📡 Microchip",
    sterilization: "✂️ Esterilización",
    passport: "🛂 Pasaporte",
    insurance: "🛡️ Seguro",
    other: "📄 Otro",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600">Cargando...</p></div>;
  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Mascota no encontrada</p>
        <Link href="/dashboard/pets" className="text-purple-600 hover:underline">← Volver al dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/pets" className="text-purple-600 hover:underline mb-2 inline-block">← Volver al dashboard</Link>
          <div className="flex items-center gap-4">
            {pet.photo_url && (
              <img src={pet.photo_url} alt={pet.name} className="w-16 h-16 rounded-full object-cover border-4 border-purple-200" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📖 Diario de Vida - {pet.name}</h1>
              <p className="text-gray-600 mt-1">Galería, historia y documentos de tu mascota</p>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab("gallery")} className={`px-6 py-3 font-semibold transition ${activeTab === "gallery" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"}`}>
            📸 Galería ({photos.length})
          </button>
          <button onClick={() => setActiveTab("milestones")} className={`px-6 py-3 font-semibold transition ${activeTab === "milestones" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"}`}>
            📖 Historia ({milestones.length})
          </button>
          <button onClick={() => setActiveTab("documents")} className={`px-6 py-3 font-semibold transition ${activeTab === "documents" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"}`}>
            📄 Documentos ({documents.length})
          </button>
        </div>

        {/* GALERÍA */}
        {activeTab === "gallery" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">📸 Galería de fotos</h2>
              <button onClick={() => setShowAddPhoto(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">+ Agregar foto</button>
            </div>

            {photos.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-6xl mb-4">📷</p>
                <p className="text-gray-600">Aún no hay fotos en la galería</p>
                <p className="text-sm text-gray-500 mt-2">Agregá fotos de cachorro, cumpleaños, familia, etc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo: any) => (
                  <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden group">
                    {/* ✅ CAMBIO CLAVE: object-contain para ver la foto completa sin recortes */}
                    <div className="relative bg-white">
                      <img src={photo.photo_url} alt={photo.caption} className="w-full h-48 object-contain border-b border-gray-100" />
                      <button onClick={() => deletePhoto(photo.id)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-700">✕</button>
                    </div>
                    <div className="p-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{categoryLabels[photo.category] || photo.category}</span>
                      {photo.caption && <p className="text-sm text-gray-700 mt-2">{photo.caption}</p>}
                      {photo.taken_at && <p className="text-xs text-gray-500 mt-1">{new Date(photo.taken_at).toLocaleDateString('es-CO')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HITOS */}
        {activeTab === "milestones" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">📖 Historia de vida</h2>
              <button onClick={() => setShowAddMilestone(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">+ Agregar hito</button>
            </div>

            {milestones.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-6xl mb-4">📖</p>
                <p className="text-gray-600">Aún no hay hitos registrados</p>
                <p className="text-sm text-gray-500 mt-2">Agregá momentos importantes: adopción, cumpleaños, logros...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((m: any) => (
                  <div key={m.id} className="bg-white rounded-lg shadow p-6 flex gap-4">
                    {m.photo_url && (
                      <div className="flex-shrink-0">
                        {/* ✅ CAMBIO CLAVE: object-contain para ver la foto completa */}
                        <img src={m.photo_url} alt={m.title} className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{categoryLabels[m.category] || m.category}</span>
                          <h3 className="text-lg font-semibold text-gray-800 mt-2">{m.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{new Date(m.milestone_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <button onClick={() => deleteMilestone(m.id)} className="text-red-600 hover:text-red-700 text-sm">🗑️</button>
                      </div>
                      {m.description && <p className="text-sm text-gray-700 mt-3">{m.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTOS */}
        {activeTab === "documents" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">📄 Documentos oficiales</h2>
              <button onClick={() => setShowAddDocument(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">+ Agregar documento</button>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-6xl mb-4">📄</p>
                <p className="text-gray-600">Aún no hay documentos</p>
                <p className="text-sm text-gray-500 mt-2">Subí pedigree, certificados de vacunación, microchip, etc.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">📄</div>
                      <div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{documentTypeLabels[doc.document_type] || doc.document_type}</span>
                        <h3 className="font-semibold text-gray-800 mt-1">{doc.document_name || documentTypeLabels[doc.document_type] || "Documento"}</h3>
                        {doc.issue_date && <p className="text-xs text-gray-500">Emitido: {new Date(doc.issue_date).toLocaleDateString('es-CO')}</p>}
                        {doc.expiry_date && <p className="text-xs text-gray-500">Vence: {new Date(doc.expiry_date).toLocaleDateString('es-CO')}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm">👁️ Ver</a>
                      <button onClick={() => deleteDocument(doc.id)} className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 text-sm">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: AGREGAR FOTO */}
        {showAddPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📸 Agregar foto a la galería</h3>
              <form onSubmit={handleAddPhoto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto *</label>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e, "photo")} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  {photoFile && <img src={photoFile} alt="Preview" className="mt-2 w-full h-40 object-contain rounded border border-gray-200 bg-white" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select value={photoForm.category} onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" required>
                    <option value="puppy">🐶 Cachorro</option>
                    <option value="birthday">🎂 Cumpleaños</option>
                    <option value="family">👨‍👩‍👧 Familia</option>
                    <option value="holiday">🏖️ Vacaciones</option>
                    <option value="trick">🎓 Trucos</option>
                    <option value="other">📷 Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input type="text" value={photoForm.caption} onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Ej: Primer cumpleaños" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la foto</label>
                  <input type="date" value={photoForm.takenAt} onChange={(e) => setPhotoForm({ ...photoForm, takenAt: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={uploadingPhoto} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400">
                    {uploadingPhoto ? "Subiendo..." : "💾 Guardar"}
                  </button>
                  <button type="button" onClick={() => { setShowAddPhoto(false); setPhotoFile(""); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: AGREGAR HITO */}
        {showAddMilestone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4"> Agregar hito</h3>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input type="text" required value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Ej: Día de adopción" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input type="date" required value={milestoneForm.milestoneDate} onChange={(e) => setMilestoneForm({ ...milestoneForm, milestoneDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select value={milestoneForm.category} onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="adoption"> Adopción / Nacimiento</option>
                    <option value="birthday">🎂 Cumpleaños</option>
                    <option value="achievement">🏆 Logros</option>
                    <option value="first">🥇 Primeras veces</option>
                    <option value="medical">💉 Médico</option>
                    <option value="other"> Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea rows={3} value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Contá la historia..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e, "milestone")} className="w-full border border-gray-300 rounded px-3 py-2" />
                  {milestoneFile && <img src={milestoneFile} alt="Preview" className="mt-2 w-full h-40 object-contain rounded border border-gray-200 bg-white" />}
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={uploadingMilestone} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400">
                    {uploadingMilestone ? "Guardando..." : "💾 Guardar"}
                  </button>
                  <button type="button" onClick={() => { setShowAddMilestone(false); setMilestoneFile(""); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: AGREGAR DOCUMENTO */}
        {showAddDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📄 Agregar documento</h3>
              <form onSubmit={handleAddDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento * (PDF o imagen)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handlePhotoSelect(e, "document")} className="w-full border border-gray-300 rounded px-3 py-2" required />
                  {documentFile && <p className="text-xs text-gray-500 mt-1">✅ Archivo seleccionado</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento *</label>
                  <select required value={documentForm.documentType} onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="pedigree">🏆 Pedigree</option>
                    <option value="vaccine_cert">💉 Certificado de Vacunación</option>
                    <option value="microchip"> Microchip</option>
                    <option value="sterilization">✂️ Esterilización</option>
                    <option value="passport"> Pasaporte</option>
                    <option value="insurance">🛡️ Seguro</option>
                    <option value="other">📄 Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del documento</label>
                  <input type="text" value={documentForm.documentName} onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Ej: Pedigree AKC" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de emisión</label>
                    <input type="date" value={documentForm.issueDate} onChange={(e) => setDocumentForm({ ...documentForm, issueDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                    <input type="date" value={documentForm.expiryDate} onChange={(e) => setDocumentForm({ ...documentForm, expiryDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={uploadingDocument} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400">
                    {uploadingDocument ? "Subiendo..." : "💾 Guardar"}
                  </button>
                  <button type="button" onClick={() => { setShowAddDocument(false); setDocumentFile(""); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}