"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "Perro",
    breed: "",
    gender: "Macho",
    birthDate: "",
    weight: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: ""
  });
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(data.id || "");
  }, []);

  useEffect(() => {
    if (clinicId && petId) loadPet();
  }, [clinicId, petId]);

  async function loadPet() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pets?clinicId=${clinicId}&petId=${petId}`);
      const data = await res.json();
      if (data.success) {
        const p = data.pet;
        setFormData({
          name: p.name || "",
          species: p.species || "Perro",
          breed: p.breed || "",
          gender: p.gender || "Macho",
          birthDate: p.birth_date || "",
          weight: p.weight || "",
          ownerName: p.owner_name || "",
          ownerPhone: p.owner_phone || "",
          ownerEmail: p.owner_email || ""
        });
        setPhotoPreview(p.photo_url || "");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/pets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          clinicId,
          ...formData,
          photoUrl: photoPreview
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Mascota actualizada correctamente");
        router.push(`/centro-clinico/pacientes/${petId}`);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar la mascota");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Cargando...</div>;

  return (
    <div style={{minHeight: "100vh", background: "#f9fafb"}}>
      <div style={{background: "#7c3aed", padding: "24px 32px", color: "white"}}>
        <div style={{maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h1 style={{fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0"}}>Editar Mascota</h1>
            <p style={{margin: 0, opacity: 0.9}}>Modificá los datos de {formData.name}</p>
          </div>
          <Link href={`/centro-clinico/pacientes/${petId}`} style={{padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"}}>
            ← Volver a la Ficha
          </Link>
        </div>
      </div>

      <div style={{maxWidth: "800px", margin: "0 auto", padding: "32px"}}>
        <form onSubmit={handleSubmit} style={{background: "white", borderRadius: "16px", padding: "32px"}}>
          
          {/* Foto */}
          <div style={{textAlign: "center", marginBottom: "32px"}}>
            <label style={{display: "block", marginBottom: "16px", fontWeight: "bold"}}>Foto de la Mascota</label>
            <div style={{width: "150px", height: "150px", margin: "0 auto", borderRadius: "50%", overflow: "hidden", border: "3px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center"}}>
              {photoPreview ? (
                <img src={photoPreview} style={{width: "100%", height: "100%", objectFit: "cover"}} />
              ) : (
                <span style={{fontSize: "48px"}}>🐾</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{marginTop: "16px"}} />
            <p style={{fontSize: "12px", color: "#6b7280", marginTop: "8px"}}>Seleccioná una imagen para actualizar la foto</p>
          </div>

          {/* Datos de la mascota */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px"}}>
            <div style={{gridColumn: "1 / -1"}}>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Nombre *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Especie *</label>
              <select required value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Raza</label>
              <input type="text" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Sexo</label>
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Fecha de nacimiento</label>
              <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Peso (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
            </div>
          </div>

          {/* Datos del dueño */}
          <div style={{borderTop: "2px solid #f3f4f6", paddingTop: "24px", marginBottom: "24px"}}>
            <h3 style={{fontSize: "20px", fontWeight: "bold", color: "#7c3aed", marginBottom: "20px"}}>Datos del Dueño</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
              <div style={{gridColumn: "1 / -1"}}>
                <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Nombre completo *</label>
                <input type="text" required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Teléfono *</label>
                <input type="tel" required value={formData.ownerPhone} onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Email</label>
                <input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{display: "flex", gap: "16px"}}>
            <Link href={`/centro-clinico/pacientes/${petId}`} style={{flex: 1, padding: "14px", background: "#e5e7eb", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "bold"}}>Cancelar</Link>
            <button type="submit" disabled={saving} style={{flex: 2, padding: "14px", background: saving ? "#9ca3af" : "#7c3aed", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer"}}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}