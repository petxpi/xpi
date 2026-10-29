"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditarPersonalPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.staffId as string;
  
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "", role: "", email: "", phone: "", specialty: "", professionalCard: ""
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [cvData, setCvData] = useState("");
  const [cvName, setCvName] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(data.id || "");
  }, []);

  useEffect(() => {
    if (clinicId && staffId) {
      fetch(`/api/staff?clinicId=${clinicId}&staffId=${staffId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const s = data.staff;
            setFormData({
              name: s.name || "", role: s.role || "", email: s.email || "",
              phone: s.phone || "", specialty: s.specialty || "", professionalCard: s.professional_card || ""
            });
            setPhotoPreview(s.photo_url || "");
            setCvData(s.cv_url || "");
            setCvName(s.cv_url ? "CV actual cargado" : "");
          }
          setLoading(false);
        });
    }
  }, [clinicId, staffId]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setCvData(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/staff", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, clinicId, ...formData, photoUrl: photoPreview, cvUrl: cvData })
    });

    setSaving(false);
    router.push("/centro-clinico/personal");
  }

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Cargando...</div>;

  const isProfessional = ["Veterinario", "Asistente Veterinario", "Administrador"].includes(formData.role);

  return (
    <div style={{padding: "32px", maxWidth: "800px", margin: "0 auto"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px"}}>
        <h1 style={{fontSize: "32px", margin: 0}}>Editar Empleado</h1>
        <Link href="/centro-clinico/personal" style={{padding: "10px 20px", background: "#e5e7eb", borderRadius: "8px", textDecoration: "none"}}>← Volver</Link>
      </div>

      <form onSubmit={handleSubmit} style={{background: "white", padding: "32px", borderRadius: "16px", border: "2px solid #e5e7eb"}}>
        {/* Foto */}
        <div style={{textAlign: "center", marginBottom: "32px"}}>
          <label style={{display: "block", marginBottom: "16px", fontWeight: "bold"}}>📸 Foto</label>
          <div style={{width: "150px", height: "150px", margin: "0 auto", borderRadius: "50%", overflow: "hidden", border: "3px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center"}}>
            {photoPreview ? <img src={photoPreview} style={{width: "100%", height: "100%", objectFit: "cover"}} /> : <span style={{fontSize: "48px"}}></span>}
          </div>
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={{marginTop: "16px"}} />
        </div>

        {/* Datos */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px"}}>
          <div style={{gridColumn: "1 / -1"}}>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Nombre *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
          </div>
          <div>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Rol *</label>
            <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}>
              <option value="">-- Selecciona --</option>
              <option value="Veterinario"> Veterinario</option>
              <option value="Asistente Veterinario">🧑‍️ Asistente</option>
              <option value="Auxiliar">💉 Auxiliar</option>
              <option value="Recepcionista">🛎️ Recepcionista</option>
              <option value="Aseo">🧹 Aseo</option>
              <option value="Administrador">👨‍💼 Administrador</option>
            </select>
          </div>
          <div>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Especialidad</label>
            <input type="text" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
          </div>
          <div>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
          </div>
          <div>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Teléfono</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
          </div>
          {isProfessional && (
            <div style={{gridColumn: "1 / -1"}}>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>🎓 Tarjeta Profesional</label>
              <input type="text" value={formData.professionalCard} onChange={(e) => setFormData({...formData, professionalCard: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} placeholder="TP-12345678" />
            </div>
          )}
        </div>

        {/* CV */}
        <div style={{marginBottom: "32px", padding: "20px", border: "2px dashed #e5e7eb", borderRadius: "12px"}}>
          <label style={{display: "block", marginBottom: "12px", fontWeight: "bold"}}>📄 Hoja de Vida (PDF)</label>
          {cvName && <p style={{color: "#10b981", marginBottom: "12px"}}>✓ {cvName}</p>}
          <input type="file" accept=".pdf" onChange={handleCvChange} style={{width: "100%"}} />
        </div>

        {/* Botones */}
        <div style={{display: "flex", gap: "16px"}}>
          <Link href="/centro-clinico/personal" style={{flex: 1, padding: "14px", background: "#e5e7eb", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "bold"}}>Cancelar</Link>
          <button type="submit" disabled={saving} style={{flex: 2, padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer"}}>
            {saving ? "Guardando..." : "Guardar Cambios ✓"}
          </button>
        </div>
      </form>
    </div>
  );
}