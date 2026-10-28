"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  pet_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  service_name: string;
  duration_minutes: number;
  price: string;
}

export default function CitasPage() {
  const [clinicId, setClinicId] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });

  // 1. Obtener el clinicId del localStorage al montar
  useEffect(() => {
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      try {
        const data = JSON.parse(clinicData);
        console.log("🏥 Datos de clínica en localStorage:", data);
        setClinicId(data.id || data.clinicId || "");
      } catch (e) {
        console.error("Error parsing clinicData:", e);
      }
    }
  }, []);

  // 2. Cargar TODAS las citas cuando cambia el clinicId (SIN filtros)
  useEffect(() => {
    if (!clinicId) {
      console.log("⚠️ No hay clinicId, no se pueden cargar citas");
      setLoading(false);
      return;
    }
    console.log("📡 Cargando TODAS las citas para clinicId:", clinicId);
    fetchAppointments(clinicId, "", "");
  }, [clinicId]); // ← Solo clinicId, SIN filtros

  // 3. Recargar cuando cambian los filtros
  useEffect(() => {
    if (clinicId) {
      console.log("🔍 Aplicando filtros:", { filterDate, filterStatus });
      fetchAppointments(clinicId, filterDate, filterStatus);
    }
  }, [filterDate, filterStatus]);

  async function fetchAppointments(cid: string, date: string, status: string) {
    setLoading(true);
    try {
      let url = `/api/appointments?clinicId=${cid}`;
      if (date) url += `&date=${date}`;
      if (status) url += `&status=${status}`;

      console.log("🔗 URL de consulta:", url);

      const res = await fetch(url);
      const data = await res.json();
      console.log("📦 Respuesta de la API:", data);

      if (data.success) {
        const apps = data.appointments || [];
        setAppointments(apps);
        calculateStats(apps);
      } else {
        console.error("❌ Error en la respuesta:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(apps: Appointment[]) {
    setStats({
      total: apps.length,
      pending: apps.filter(a => a.status === 'pending').length,
      confirmed: apps.filter(a => a.status === 'confirmed').length,
      completed: apps.filter(a => a.status === 'completed').length,
      cancelled: apps.filter(a => a.status === 'cancelled').length,
    });
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (res.ok) {
        fetchAppointments(clinicId, filterDate, filterStatus);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#7c3aed';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#7c3aed", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Gestión de Citas</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Administra las reservas de tu clínica</p>
          </div>
          <Link 
            href="/centro-clinico/dashboard" 
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
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "2px solid #e5e7eb" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>Total Citas</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1f2937" }}>{stats.total}</div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "2px solid #f59e0b" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>Pendientes</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}>{stats.pending}</div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "2px solid #7c3aed" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>Confirmadas</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#7c3aed" }}>{stats.confirmed}</div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "2px solid #10b981" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>Completadas</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#10b981" }}>{stats.completed}</div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "2px solid #ef4444" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>Canceladas</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ef4444" }}>{stats.cancelled}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Filtros</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Fecha (opcional)</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  style={{ marginTop: "8px", background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                >
                  ✕ Limpiar fecha
                </button>
              )}
            </div>
            <div>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", background: "white" }}
              >
                <option value="">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Citas */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
            Citas ({appointments.length})
          </h3>

          {!clinicId ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
              <h4 style={{ color: "#ef4444", marginBottom: "8px" }}>No se encontró la clínica</h4>
              <p style={{ color: "#6b7280" }}>
                No hay datos de clínica en el navegador. Por favor iniciá sesión nuevamente.
              </p>
              <Link 
                href="/centro-clinico/login"
                style={{ 
                  display: "inline-block", 
                  marginTop: "16px", 
                  padding: "12px 24px", 
                  background: "#7c3aed", 
                  color: "white", 
                  textDecoration: "none", 
                  borderRadius: "10px", 
                  fontWeight: "700" 
                }}
              >
                Ir al Login
              </Link>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#7c3aed", fontSize: "16px", fontWeight: "600" }}>
              ⏳ Cargando citas...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#6b7280" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📅</div>
              <h4 style={{ color: "#374151", marginBottom: "8px" }}>No hay citas</h4>
              <p>Aún no se han registrado citas para los filtros seleccionados</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ color: "#1f2937", fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>
                        {apt.client_name}
                      </h4>
                      <p style={{ color: "#6b7280", fontSize: "14px", margin: "0" }}>
                        🐾 Mascota: <strong>{apt.pet_name}</strong>
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "6px 14px",
                        background: getStatusColor(apt.status),
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>📅 Fecha</div>
                      <div style={{ fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                        {new Date(apt.appointment_date + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                    <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>⏰ Hora</div>
                      <div style={{ fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>{apt.appointment_time}</div>
                    </div>
                    <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>🩺 Servicio</div>
                      <div style={{ fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>{apt.service_name}</div>
                    </div>
                    <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>💰 Precio</div>
                      <div style={{ fontSize: "14px", color: "#10b981", fontWeight: "700" }}>${parseFloat(apt.price).toFixed(2)}</div>
                    </div>
                  </div>

                  {apt.notes && (
                    <div style={{ background: "#f3e8ff", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", color: "#7c3aed" }}>
                      📝 <strong>Notas:</strong> {apt.notes}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      📞 {apt.client_phone} {apt.client_email && `| ✉️ ${apt.client_email}`}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                          style={{
                            padding: "8px 16px",
                            background: "#7c3aed",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          ✓ Confirmar
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'completed')}
                          style={{
                            padding: "8px 16px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          ✓✓ Completar
                        </button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            if (confirm("¿Seguro que querés cancelar esta cita?")) {
                              updateStatus(apt.id, 'cancelled');
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}