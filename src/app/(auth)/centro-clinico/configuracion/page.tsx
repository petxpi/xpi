"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfiguracionPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "Colombia", description: "",
    logoUrl: "", bannerUrl: "",
    primaryColor: "#7c3aed", secondaryColor: "#10b981",
    mondayOpen: "08:00", mondayClose: "18:00",
    tuesdayOpen: "08:00", tuesdayClose: "18:00",
    wednesdayOpen: "08:00", wednesdayClose: "18:00",
    thursdayOpen: "08:00", thursdayClose: "18:00",
    fridayOpen: "08:00", fridayClose: "18:00",
    saturdayOpen: "08:00", saturdayClose: "14:00",
    sundayClosed: true,
    appointmentDuration: 30, appointmentMargin: 10,
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    const id = data.id || "";
    setClinicId(id);
    if (id) loadClinicData(id);
  }, []);

  async function loadClinicData(id: string) {
    try {
      const res = await fetch(`/api/clinics/${id}`);
      const data = await res.json();
      if (data.success && data.clinic) {
        const c = data.clinic;
        setFormData({
          name: c.name || "", email: c.email || "", phone: c.phone || "", address: c.address || "",
          city: c.city || "", country: c.country || "Colombia", description: c.description || "",
          logoUrl: c.logo_url || "", bannerUrl: c.banner_url || "",
          primaryColor: c.primary_color || "#7c3aed", secondaryColor: c.secondary_color || "#10b981",
          mondayOpen: c.monday_open || "08:00", mondayClose: c.monday_close || "18:00",
          tuesdayOpen: c.tuesday_open || "08:00", tuesdayClose: c.tuesday_close || "18:00",
          wednesdayOpen: c.wednesday_open || "08:00", wednesdayClose: c.wednesday_close || "18:00",
          thursdayOpen: c.thursday_open || "08:00", thursdayClose: c.thursday_close || "18:00",
          fridayOpen: c.friday_open || "08:00", fridayClose: c.friday_close || "18:00",
          saturdayOpen: c.saturday_open || "08:00", saturdayClose: c.saturday_close || "14:00",
          sundayClosed: c.sunday_closed !== 0 && c.sunday_closed !== false,
          appointmentDuration: c.appointment_duration || 30, appointmentMargin: c.appointment_margin || 10,
        });
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${clinicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sunday_closed: formData.sundayClosed ? 1 : 0,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          logo_url: formData.logoUrl,
          banner_url: formData.bannerUrl,
          appointment_duration: formData.appointmentDuration,
          appointment_margin: formData.appointmentMargin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "general", label: "🏥 Datos y Apariencia" },
    { id: "schedule", label: "⏰ Horarios" },
    { id: "appointments", label: "📅 Reglas de Citas" },
    { id: "quick", label: "⚡ Accesos Rápidos" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ background: formData.primaryColor, padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>⚙️ Configuración de la Clínica</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Gestiona los datos, apariencia y reglas de tu centro</p>
          </div>
          <Link href="/centro-clinico/dashboard" style={{ padding: "10px 20px", background: "white", color: formData.primaryColor, textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}>← Volver al Dashboard</Link>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "12px 20px", background: activeTab === tab.id ? formData.primaryColor : "white",
              color: activeTab === tab.id ? "white" : "#374151", border: "2px solid #e5e7eb",
              borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "14px",
            }}>{tab.label}</button>
          ))}
        </div>

        {success && (
          <div style={{ background: "#d1fae5", border: "2px solid #10b981", borderRadius: "10px", padding: "16px", marginBottom: "24px", color: "#065f46", fontWeight: "bold" }}>
            ✅ Configuración guardada correctamente
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "16px", padding: "32px" }}>
          {activeTab === "general" && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>Datos Generales y Apariencia</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Logo de la Clínica</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} style={{ marginBottom: "8px" }} />
                  {formData.logoUrl && <img src={formData.logoUrl} alt="Logo" style={{ width: "100px", height: "100px", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: "8px" }} />}
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Imagen de Banner</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'bannerUrl')} style={{ marginBottom: "8px" }} />
                  {formData.bannerUrl && <img src={formData.bannerUrl} alt="Banner" style={{ width: "100%", maxHeight: "100px", objectFit: "cover", border: "1px solid #e5e7eb", borderRadius: "8px" }} />}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Color Primario</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} style={{ width: "50px", height: "40px", border: "none", cursor: "pointer" }} />
                    <input type="text" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} style={{ flex: 1, padding: "8px", border: "2px solid #e5e7eb", borderRadius: "6px" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Color Secundario</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} style={{ width: "50px", height: "40px", border: "none", cursor: "pointer" }} />
                    <input type="text" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} style={{ flex: 1, padding: "8px", border: "2px solid #e5e7eb", borderRadius: "6px" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nombre de la Clínica *</label>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Teléfono *</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Dirección</label>
                  <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Ciudad</label>
                  <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>País</label>
                  <input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>Horarios de Atención</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => {
                  const dayNames: Record<string, string> = { monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado" };
                  return (
                    <div key={day} style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr", gap: "12px", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                      <span style={{ fontWeight: "bold" }}>{dayNames[day]}</span>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Apertura</label>
                        <input type="time" value={(formData as any)[`${day}Open`]} onChange={(e) => setFormData({ ...formData, [`${day}Open`]: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e5e7eb", borderRadius: "6px", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Cierre</label>
                        <input type="time" value={(formData as any)[`${day}Close`]} onChange={(e) => setFormData({ ...formData, [`${day}Close`]: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e5e7eb", borderRadius: "6px", boxSizing: "border-box" }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "12px", alignItems: "center", padding: "12px", background: "#fee2e2", borderRadius: "8px" }}>
                  <span style={{ fontWeight: "bold" }}>Domingo</span>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" checked={formData.sundayClosed} onChange={(e) => setFormData({ ...formData, sundayClosed: e.target.checked })} /> Cerrado los domingos
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>Reglas de Citas</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Duración por defecto (minutos)</label>
                  <input type="number" value={formData.appointmentDuration} onChange={(e) => setFormData({ ...formData, appointmentDuration: parseInt(e.target.value) || 30 })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Margen entre citas (minutos)</label>
                  <input type="number" value={formData.appointmentMargin} onChange={(e) => setFormData({ ...formData, appointmentMargin: parseInt(e.target.value) || 10 })} style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "quick" && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>Accesos Rápidos</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                <Link href="/centro-clinico/servicios" style={{ padding: "24px", background: formData.primaryColor, color: "white", textDecoration: "none", borderRadius: "12px", textAlign: "center", fontWeight: "bold" }}>💊 Gestionar Servicios</Link>
                <Link href="/centro-clinico/personal" style={{ padding: "24px", background: formData.secondaryColor, color: "white", textDecoration: "none", borderRadius: "12px", textAlign: "center", fontWeight: "bold" }}>👥 Gestionar Personal</Link>
                <Link href="/centro-clinico/pacientes" style={{ padding: "24px", background: "#f59e0b", color: "white", textDecoration: "none", borderRadius: "12px", textAlign: "center", fontWeight: "bold" }}>🐾 Gestionar Pacientes</Link>
                <Link href="/centro-clinico/citas" style={{ padding: "24px", background: "#3b82f6", color: "white", textDecoration: "none", borderRadius: "12px", textAlign: "center", fontWeight: "bold" }}>📅 Ver Agenda de Citas</Link>
              </div>
            </div>
          )}

          {activeTab !== "quick" && (
            <div style={{ display: "flex", gap: "16px", marginTop: "32px", paddingTop: "24px", borderTop: "2px solid #e5e7eb" }}>
              <Link href="/centro-clinico/dashboard" style={{ flex: 1, padding: "14px", background: "#e5e7eb", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>Cancelar</Link>
              <button type="submit" disabled={loading} style={{ flex: 2, padding: "14px", background: loading ? "#9ca3af" : formData.secondaryColor, color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Guardando..." : "💾 Guardar Configuración"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}