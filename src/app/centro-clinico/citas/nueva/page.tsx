"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: string;
}

export default function NuevaCitaPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    petName: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });

  useEffect(() => {
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      const data = JSON.parse(clinicData);
      setClinicId(data.id || data.clinicId || "");
    }
  }, []);

  useEffect(() => {
    if (!clinicId) return;
    fetchServices();
  }, [clinicId]);

  async function fetchServices() {
    try {
      const res = await fetch(`/api/clinics/public/vera`); // Ajustar según el slug
      const data = await res.json();
      if (data.services) {
        setServices(data.services);
      }
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          ...formData
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/centro-clinico/citas");
        }, 2000);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la cita");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", maxWidth: "500px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>✅</div>
          <h2 style={{ color: "#10b981", fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>¡Cita Creada!</h2>
          <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "24px" }}>
            La cita ha sido agendada exitosamente.
          </p>
          <div style={{ background: "#f3e8ff", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
            <p style={{ color: "#7c3aed", fontWeight: "600", margin: "4px 0" }}>📅 {new Date(formData.appointmentDate + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p style={{ color: "#10b981", fontWeight: "700", fontSize: "20px", margin: "4px 0" }}>⏰ {formData.appointmentTime}</p>
          </div>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Redirigiendo a la lista de citas...</p>
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
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Nueva Cita</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Agenda una nueva cita para tu clínica</p>
          </div>
          <Link 
            href="/centro-clinico/citas" 
            style={{ 
              padding: "10px 20px", 
              background: "white", 
              color: "#7c3aed", 
              textDecoration: "none", 
              borderRadius: "10px", 
              fontWeight: "700",
              fontSize: "14px"
            }}
          >
            ← Volver a Citas
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <form onSubmit={handleSubmit}>
            {/* Datos del Cliente */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#7c3aed", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #f3e8ff" }}>
                👤 Datos del Cliente
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Email</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Datos de la Mascota */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #d1fae5" }}>
                🐾 Datos de la Mascota
              </h3>
              <div>
                <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Nombre de la mascota *</label>
                <input
                  type="text"
                  required
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                  placeholder="Firulais"
                />
              </div>
            </div>

            {/* Servicio */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#7c3aed", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #f3e8ff" }}>
                🩺 Servicio
              </h3>
              <div>
                <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Selecciona un servicio *</label>
                <select
                  required
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", background: "white" }}
                >
                  <option value="">-- Selecciona un servicio --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${parseFloat(service.price).toFixed(2)} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #d1fae5" }}>
                📅 Fecha y Hora
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Hora *</label>
                  <input
                    type="time"
                    required
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ color: "#7c3aed", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #f3e8ff" }}>
                📝 Notas Adicionales
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
                placeholder="Observaciones especiales, alergias, condiciones médicas, etc."
              />
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: "16px" }}>
              <Link
                href="/centro-clinico/citas"
                style={{ flex: 1, padding: "14px", background: "#e5e7eb", color: "#1f2937", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", textAlign: "center" }}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, padding: "14px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Creando..." : "Crear Cita ✓"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}