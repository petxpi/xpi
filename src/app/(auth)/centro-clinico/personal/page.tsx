"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  photo_url: string;
  professional_card: string;
  cv_url: string;
  status: string;
  created_at: string;
}

export default function PersonalPage() {
  const [clinicId, setClinicId] = useState("");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      const data = JSON.parse(clinicData);
      setClinicId(data.id || data.clinicId || "");
    }
  }, []);

  useEffect(() => {
    if (!clinicId) return;
    fetchStaff();
  }, [clinicId]);

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff?clinicId=${clinicId}`);
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function downloadCv(cvUrl: string, name: string) {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = `Hoja_de_Vida_${name.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    (s.specialty && s.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      "Veterinario": "#7c3aed",
      "Asistente Veterinario": "#10b981",
      "Auxiliar": "#3b82f6",
      "Recepcionista": "#f59e0b",
      "Aseo": "#6b7280",
      "Administrador": "#ef4444"
    };
    return colors[role] || "#6b7280";
  };

  const isProfessional = (role: string) => {
    return ["Veterinario", "Asistente Veterinario", "Administrador"].includes(role);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#7c3aed", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Personal</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Gestión del equipo de tu clínica</p>
          </div>
          <Link
            href="/centro-clinico/dashboard"
            style={{ padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {/* Barra de acciones */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Buscar por nombre, rol o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "300px", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px" }}
          />
          <Link
            href="/centro-clinico/personal/nuevo"
            style={{ padding: "12px 24px", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)" }}
          >
            + Registrar Nuevo Empleado
          </Link>
        </div>

        {/* Lista de Personal */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#7c3aed" }}>Cargando personal...</div>
          ) : filteredStaff.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#6b7280" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>👥</div>
              <h4 style={{ color: "#374151", marginBottom: "8px" }}>No hay personal registrado</h4>
              <p>Comenzá registrando al primer miembro de tu equipo.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    background: "white",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#f3e8ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px"
                      }}>
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "24px" }}>👤</span>
                        )}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>{member.name}</h3>
                        <span style={{
                          display: "inline-block",
                          marginTop: "4px",
                          padding: "2px 8px",
                          background: getRoleColor(member.role),
                          color: "white",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600"
                        }}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
                    {member.specialty && (
                      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                        Especialidad: <strong style={{ color: "#1f2937" }}>{member.specialty}</strong>
                      </div>
                    )}
                    {isProfessional(member.role) && member.professional_card && (
                      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                        Tarjeta Profesional: <strong style={{ color: "#7c3aed" }}>{member.professional_card}</strong>
                      </div>
                    )}
                    {member.email && (
                      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                        {member.email}
                      </div>
                    )}
                    {member.phone && (
                      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                        {member.phone}
                      </div>
                    )}
                    
                    {/* BOTONES DE ACCIÓN */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      {member.cv_url && (
                        <button
                          onClick={() => downloadCv(member.cv_url, member.name)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "#7c3aed",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px"
                          }}
                        >
                          Descargar CV
                        </button>
                      )}
                      <Link
                        href={`/centro-clinico/personal/${member.id}/editar`}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "12px",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px"
                        }}
                      >
                        Editar
                      </Link>
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