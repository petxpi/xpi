"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [clinicId, setClinicId] = useState("");
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activePets: 0,
    services: 0,
    staff: 0,
  });
  const [todayAppointmentsDetails, setTodayAppointmentsDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(data.id || "");
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadStats();
    }
  }, [clinicId]);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTodayAppointmentsDetails(data.todayAppointmentsDetails || []);
      }
    } catch (error) {
      console.error("Error cargando stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#7c3aed", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Bienvenido de vuelta. Aquí tienes un resumen de tu clínica.</p>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "2px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Citas Hoy</span>
              <span style={{ fontSize: "32px" }}>📅</span>
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#7c3aed" }}>{loading ? "..." : stats.todayAppointments}</div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "2px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Pacientes Activos</span>
              <span style={{ fontSize: "32px" }}>🐾</span>
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#10b981" }}>{loading ? "..." : stats.activePets}</div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "2px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Servicios</span>
              <span style={{ fontSize: "32px" }}>💊</span>
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#7c3aed" }}>{loading ? "..." : stats.services}</div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "2px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Personal</span>
              <span style={{ fontSize: "32px" }}>👥</span>
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#10b981" }}>{loading ? "..." : stats.staff}</div>
          </div>
        </div>

        {/* Citas de Hoy */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px", color: "#1f2937" }}>Citas de Hoy</h2>
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Cargando...</p>
          ) : todayAppointmentsDetails.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📅</div>
              <p style={{ color: "#6b7280" }}>No hay citas programadas para hoy</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {todayAppointmentsDetails.map((apt: any) => (
                <div key={apt.id} style={{ padding: "16px", border: "2px solid #e5e7eb", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>🐾 {apt.pet_name || "Sin nombre"}</p>
                      <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>🔧 {apt.service_name || "Sin servicio"}</p>
                    </div>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      background: apt.status === "confirmed" ? "#d1fae5" : apt.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                      color: apt.status === "confirmed" ? "#065f46" : apt.status === "cancelled" ? "#991b1b" : "#92400e"
                    }}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <Link
            href="/centro-clinico/configuracion"
            style={{
              padding: "24px",
              background: "#10b981",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)"
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚙️</div>
            Configuración
          </Link>

          <Link
            href="/centro-clinico/servicios"
            style={{
              padding: "24px",
              background: "#7c3aed",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)"
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>💊</div>
            Gestionar Servicios
          </Link>

          <Link
            href="/centro-clinico/personal"
            style={{
              padding: "24px",
              background: "#10b981",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)"
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
            Gestionar Personal
          </Link>

          <Link
            href="/centro-clinico/citas/nueva"
            style={{
              padding: "24px",
              background: "#7c3aed",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)"
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📅</div>
            Nueva Cita
          </Link>
        </div>
      </div>
    </div>
  );
}