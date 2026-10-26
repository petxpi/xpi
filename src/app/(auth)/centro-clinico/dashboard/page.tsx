"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CentroClinicoDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊", color: "purple", href: "/centro-clinico/dashboard" },
    { id: "agenda", name: "Agenda", icon: "📅", color: "citric", href: "/centro-clinico/citas" },
    { id: "pacientes", name: "Pacientes", icon: "", color: "purple", href: "/centro-clinico/pacientes" },
    { id: "servicios", name: "Servicios", icon: "⚕️", color: "citric", href: "/centro-clinico/servicios" },
    { id: "personal", name: "Personal", icon: "", color: "purple", href: "/centro-clinico/personal" },
    { id: "reportes", name: "Reportes", icon: "📈", color: "citric", href: "/centro-clinico/reportes" },
  ];

  const stats = [
    { label: "Citas Hoy", value: "12", color: "purple", icon: "" },
    { label: "Pacientes Activos", value: "148", color: "citric", icon: "" },
    { label: "Servicios", value: "8", color: "purple", icon: "⚕️" },
    { label: "Personal", value: "5", color: "citric", icon: "" },
  ];

  const recentAppointments = [
    { time: "09:00", pet: "Luna", owner: "María García", service: "Vacunación", status: "Completada" },
    { time: "10:30", pet: "Max", owner: "Juan Pérez", service: "Consulta General", status: "En curso" },
    { time: "11:45", pet: "Coco", owner: "Ana López", service: "Desparasitación", status: "Pendiente" },
    { time: "14:00", pet: "Rocky", owner: "Carlos Ruiz", service: "Cirugía Menor", status: "Programada" },
  ];

  const getColor = (color: string) => {
    if (color === "citric") return { main: "#84cc16", light: "#ecfccb", text: "#4d7c0f" };
    return { main: "#7c3aed", light: "#f3e8ff", text: "#6d28d9" };
  };

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
              background: "linear-gradient(135deg, #7c3aed 0%, #84cc16 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}>
              
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
          {stats.map((stat) => {
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
                      {stat.value}
                    </p>
                  </div>
                  <span style={{ fontSize: "32px" }}>{stat.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Citas recientes */}
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
                {recentAppointments.map((apt, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "16px 12px", fontSize: "14px", color: "#1f2937" }}>{apt.time}</td>
                    <td style={{ padding: "16px 12px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{apt.pet}</td>
                    <td style={{ padding: "16px 12px", fontSize: "14px", color: "#6b7280" }}>{apt.owner}</td>
                    <td style={{ padding: "16px 12px", fontSize: "14px", color: "#6b7280" }}>{apt.service}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: apt.status === "Completada" ? "#ecfccb" : apt.status === "En curso" ? "#fef3c7" : "#e5e7eb",
                        color: apt.status === "Completada" ? "#4d7c0f" : apt.status === "En curso" ? "#d97706" : "#6b7280",
                      }}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <Link
            href="/centro-clinico/servicios"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
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
              background: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(132, 204, 22, 0.3)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
            Gestionar Personal
          </Link>
          
          <Link
            href="/centro-clinico/citas"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}></div>
            Nueva Cita
          </Link>
        </div>
      </main>
    </div>
  );
}