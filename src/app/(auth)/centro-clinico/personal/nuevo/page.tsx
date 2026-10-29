"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoPersonalPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    specialty: "",
    professionalCard: ""
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [cvName, setCvName] = useState("");
  const [cvData, setCvData] = useState("");

  useEffect(() => {
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      const data = JSON.parse(clinicData);
      setClinicId(data.id || data.clinicId || "");
    }
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Solo se permiten archivos PDF");
        return;
      }
      setCvName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const isProfessional = ["Veterinario", "Asistente Veterinario", "Administrador"].includes(formData.role);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          ...formData,
          photoUrl: photoPreview,
          cvUrl: cvData
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/centro-clinico/personal");
        }, 2000);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar el empleado");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", maxWidth: "500px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>👥</div>
          <h2 style={{ color: "#10b981", fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>¡Empleado Registrado!</h2>
          <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "24px" }}>
            <strong>{formData.name}</strong> ha sido registrado exitosamente.
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Redirigiendo a la lista de personal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#7c3aed", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Nuevo Empleado</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Registrar un nuevo miembro del equipo</p>
          </div>
          <Link
            href="/centro-clinico/personal"
            style={{ padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}
          >
            ← Volver a Personal
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <form onSubmit={handleSubmit}>
            {/* Foto */}
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "16px", fontSize: "14px" }}>
                📸 Foto del Empleado
              </label>
              <div style={{
                width: "150px",
                height: "150px",
                margin: "0 auto",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px dashed #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f9fafb",
                cursor: "pointer"
              }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "48px", color: "#9ca3af" }}>👤</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ marginTop: "16px", padding: "8px", border: "2px solid #e5e7eb", borderRadius: "8px", width: "100%", maxWidth: "300px" }}
              />
            </div>

            {/* Datos del Empleado */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#7c3aed", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #f3e8ff" }}>
                👤 Datos del Empleado
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="Dr. Juan Pérez"
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Rol *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", background: "white" }}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Veterinario"> Veterinario</option>
                    <option value="Asistente Veterinario">🧑‍️ Asistente Veterinario</option>
                    <option value="Auxiliar">💉 Auxiliar</option>
                    <option value="Recepcionista">🛎️ Recepcionista</option>
                    <option value="Aseo">🧹 Aseo</option>
                    <option value="Administrador">👨‍💼 Administrador</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Especialidad</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="Cirugía, Dermatología, etc."
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="empleado@clinica.com"
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                {/* Tarjeta Profesional - Solo si es profesional */}
                {isProfessional && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>
                      🎓 Tarjeta Profesional
                    </label>
                    <input
                      type="text"
                      value={formData.professionalCard}
                      onChange={(e) => setFormData({ ...formData, professionalCard: e.target.value })}
                      style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="TP-12345678"
                    />
                    <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                      Número de tarjeta profesional (obligatorio para veterinarios y administradores)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hoja de Vida */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #d1fae5" }}>
                📄 Hoja de Vida
              </h3>
              <div style={{ padding: "20px", border: "2px dashed #e5e7eb", borderRadius: "12px", background: "#f9fafb" }}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCvChange}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", background: "white" }}
                />
                {cvName && (
                  <div style={{ marginTop: "12px", padding: "12px", background: "#d1fae5", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}></span>
                    <span style={{ color: "#065f46", fontWeight: "600", fontSize: "14px" }}>{cvName}</span>
                  </div>
                )}
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                  Subí la hoja de vida en formato PDF (máximo 5MB)
                </p>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: "16px" }}>
              <Link
                href="/centro-clinico/personal"
                style={{ flex: 1, padding: "14px", background: "#e5e7eb", color: "#1f2937", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", textAlign: "center" }}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, padding: "14px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Registrando..." : "Registrar Empleado ✓"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}