"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Appointment {
  appointment_time: string;
  pet_name: string;
  client_name: string;
  service_name: string;
  status: string;
}

export default function CentroClinicoDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activePets: 0,
    services: 0,
    staff: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setMounted(true);
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      try {
        const data = JSON.parse(clinicData);
        setClinicId(data.id || data.clinicId || "");
      } catch (e) {
        console.error("Error:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!clinicId) {
      setLoading(false);
      return;
    }
    fetchStats();
  }, [clinicId]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTodayAppointments(data.todayAppointmentsDetails || []);
      }
    } catch (error) {
      console.error("Error cargando stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊", color: "purple", href: "/centro-clinico/dashboard" },
    { id: "agenda", name: "Agenda", icon: "📅", color: "green", href: "/centro-clinico/citas" },
    { id: "pacientes", name: "Pacientes", icon: "🐾", color: "purple", href: "/centro-clinico/pacientes" },
    { id: "servicios", name: "Servicios", icon: "⚕️", color: "green", href: "/centro-clinico/servicios" },
    { id: "personal", name: "Personal", icon: "👥", color: "purple", href: "/centro-clinico/personal" },
    { id: "reportes", name: "Reportes", icon: "📈", color: "green", href: "/centro-clinico/reportes" },
  ];

  const statsCards = [
    { label: "Citas Hoy", value: stats.todayAppointments, color: "purple", icon: "📅" },
    { label: "Pacientes Activos", value: stats.activePets, color: "green", icon: "🐾" },
    { label: "Servicios", value: stats.services, color: "purple", icon: "⚕️" },
    { label: "Personal", value: stats.staff, color: "green", icon: "👥" },
  ];

  const getColor = (color: string) => {
    if (color === "green") return { main: "#10b981", light: "#d1fae5", text: "#065f46" };
    return { main: "#7c3aed", light: "#f3e8ff", text: "#6d28d9" };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { background: "#d1fae5", color: "#065f46", label: "Completada" };
      case "confirmed":
        return { background: "#f3e8ff", color: "#6d28d9", label: "Confirmada" };
      case "pending":
        return { background: "#fef3c7", color: "#92400e", label: "Pendiente" };
      default:
        return { background: "#e5e7eb", color: "#6b7280", label: status };
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: "250px",
        background: "white",
        borderRight: "1px solid #e5e7eb",
        padding: "20px 0",
        position: "fixed",
        height: "100vh",
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "#7c3aed",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}>
              🏥
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#1f2937" }}>
                Centro Clínico
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                Clínica Veterinaria
              </p>
            </div>
          </div>
        </div>

        <nav style={{ padding: "20px 0" }}>
          {menuItems.map((item) => {
            const colors = getColor(item.color);
            const isActive = activeMenu === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveMenu(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  textDecoration: "none",
                  background: isActive ? colors.light : "transparent",
                  borderLeft: isActive ? `4px solid ${colors.main}` : "4px solid transparent",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? colors.main : "#4b5563",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid #e5e7eb", marginTop: "auto" }}>
          <Link
            href="/"
            style={{
              display: "block",
              padding: "10px",
              textAlign: "center",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{ marginLeft: "250px", flex: 1, padding: "30px" }}>
        <header style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>
            Dashboard
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Bienvenido de vuelta. Aquí tienes un resumen de tu clínica.
          </p>
        </header>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          {statsCards.map((stat) => {
            const colors = getColor(stat.color);
            return (
              <div
                key={stat.label}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  border: `2px solid ${colors.light}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b7280" }}>
                      {stat.label}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: colors.main,
                    }}>
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <span style={{ fontSize: "32px" }}>{stat.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Citas de hoy */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          marginBottom: "30px",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", margin: "0 0 20px 0" }}>
            Citas de Hoy
          </h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "#7c3aed", padding: "40px" }}>Cargando...</p>
          ) : todayAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
              <p>No hay citas programadas para hoy</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Hora</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Mascota</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Propietario</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Servicio</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt, idx) => {
                    const statusStyle = getStatusStyle(apt.status);
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "16px 12px", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>{apt.appointment_time}</td>
                        <td style={{ padding: "16px 12px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{apt.pet_name}</td>
                        <td style={{ padding: "16px 12px", fontSize: "14px", color: "#6b7280" }}>{apt.client_name}</td>
                        <td style={{ padding: "16px 12px", fontSize: "14px", color: "#6b7280" }}>{apt.service_name}</td>
                        <td style={{ padding: "16px 12px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: statusStyle.background,
                            color: statusStyle.color,
                          }}>
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <Link
            href="/centro-clinico/crear"
            style={{
              background: "#10b981",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏥</div>
            Crear Nueva Clínica
          </Link>

          <Link
            href="/centro-clinico/servicios"
            style={{
              background: "#7c3aed",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚕️</div>
            Gestionar Servicios
          </Link>

          <Link
            href="/centro-clinico/personal"
            style={{
              background: "#10b981",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
            Gestionar Personal
          </Link>

          <Link
            href="/centro-clinico/citas/nueva"
            style={{
              background: "#7c3aed",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📅</div>
            Nueva Cita
          </Link>
        </div>
      </main>
    </div>
  );
}