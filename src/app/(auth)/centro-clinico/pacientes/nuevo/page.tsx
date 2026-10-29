"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoPacientePage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    setLoading(true);

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          ...formData,
          photoUrl: photoPreview
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/centro-clinico/pacientes"), 2000);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar la mascota");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", maxWidth: "500px", width: "90%", textAlign: "center" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🐾</div>
          <h2 style={{ color: "#10b981", fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>Mascota Registrada!</h2>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Redirigiendo a la lista de pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ background: "#7c3aed", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Nueva Mascota</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Registrar un nuevo paciente</p>
          </div>
          <Link href="/centro-clinico/pacientes" style={{ padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}>
            ← Volver
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px" }}>
        <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "16px", padding: "32px" }}>

          {/* Foto de la mascota */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "16px", fontWeight: "bold" }}>Foto de la Mascota</label>
            <div style={{ width: "150px", height: "150px", margin: "0 auto", borderRadius: "50%", overflow: "hidden", border: "3px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photoPreview ? (
                <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "48px" }}>🐾</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ marginTop: "16px" }} />
          </div>

          {/* Datos de la mascota */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nombre *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Especie *</label>
              <select required value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Raza</label>
              <input type="text" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Sexo</label>
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }}>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Fecha de nacimiento</label>
              <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Peso (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Datos del dueño */}
          <div style={{ borderTop: "2px solid #f3f4f6", paddingTop: "24px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#7c3aed", marginBottom: "20px" }}>Datos del Dueño</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nombre completo *</label>
                <input type="text" required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Teléfono *</label>
                <input type="tel" required value={formData.ownerPhone} onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Email</label>
                <input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/centro-clinico/pacientes" style={{ flex: 1, padding: "14px", background: "#e5e7eb", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>Cancelar</Link>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: "14px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Registrando..." : "Registrar Mascota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}