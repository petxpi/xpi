"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CrearClinicaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Colombia",
    specialty: "",
    logoUrl: "",
    businessImageUrl: "",
  });

  useEffect(() => {
    setMounted(true);
    const pendingData = localStorage.getItem("pendingClinic");
    if (pendingData) {
      const data = JSON.parse(pendingData);
      setFormData({
        ...formData,
        name: data.clinicName || "",
        ownerName: data.ownerName || "",
        email: data.email || "",
        specialty: data.specialty || "",
      });
    }
  }, []);

  if (!mounted) return null;

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "businessImageUrl") {
    const file = e.target.files?.[0];
    if (!file) return;

    const isLogo = field === "logoUrl";
    if (isLogo) setUploadingLogo(true);
    else setUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          folder: "xpipet/clinics",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setFormData({ ...formData, [field]: data.url });
            setMessage(`✅ ${isLogo ? "Logo" : "Imagen del negocio"} subido correctamente`);
            setTimeout(() => setMessage(""), 3000);
          } else {
            setMessage("❌ Error al subir la imagen");
          }
        })
        .catch(() => setMessage("❌ Error de conexión"))
        .finally(() => {
          if (isLogo) setUploadingLogo(false);
          else setUploadingImage(false);
        });
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const clinicId = crypto.randomUUID();

    fetch("/api/clinics/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicId, ...formData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clinicId) {
          localStorage.setItem("clinicData", JSON.stringify({
            id: clinicId,
            name: formData.name,
            email: formData.email,
            status: "pending",
            logoUrl: formData.logoUrl,
          }));
          setMessage("✅ Clínica creada. Pendiente de aprobación del administrador.");
          setTimeout(() => router.push("/centro-clinico/pendiente"), 2000);
        } else {
          setMessage(data.message || "Error al crear clínica");
        }
      })
      .catch(() => setMessage("Error de conexión"))
      .finally(() => setLoading(false));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "white",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f3e8ff 0%, #d1fae5 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", maxWidth: "700px", width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 16px" }}>🏥</div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>Crear tu Clínica</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>Completa los datos de tu centro veterinario</p>
        </div>

        {message && (
          <div style={{
            background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${message.includes("✅") ? "#10b981" : "#dc2626"}`,
            color: message.includes("✅") ? "#065f46" : "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}>{message}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* LOGO */}
          <div>
            <label style={labelStyle}>Logo de la clínica</label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {formData.logoUrl && (
                <img src={formData.logoUrl} alt="Logo" style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", border: "2px solid #e5e7eb" }} />
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "logoUrl")}
                  disabled={uploadingLogo}
                  style={{ ...inputStyle, padding: "10px" }}
                />
                {uploadingLogo && <p style={{ fontSize: "12px", color: "#7c3aed", marginTop: "4px" }}>Subiendo logo...</p>}
              </div>
            </div>
          </div>

          {/* IMAGEN DEL NEGOCIO */}
          <div>
            <label style={labelStyle}>Imagen del negocio</label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {formData.businessImageUrl && (
                <img src={formData.businessImageUrl} alt="Negocio" style={{ width: "120px", height: "80px", borderRadius: "12px", objectFit: "cover", border: "2px solid #e5e7eb" }} />
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "businessImageUrl")}
                  disabled={uploadingImage}
                  style={{ ...inputStyle, padding: "10px" }}
                />
                {uploadingImage && <p style={{ fontSize: "12px", color: "#7c3aed", marginTop: "4px" }}>Subiendo imagen...</p>}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nombre de la clínica *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Clínica Veterinaria XpiPet"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Propietario *</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
                placeholder="Dr. Juan Pérez"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="clinica@email.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+57 300 123 4567"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Dirección</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle 123 #45-67"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bogotá"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>País</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Colombia"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Especialidad principal</label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Medicina general, Cirugía, etc."
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 32px",
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
            }}
          >
            {loading ? "Creando..." : "Crear Clínica"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "#7c3aed", textDecoration: "none", fontSize: "14px" }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}