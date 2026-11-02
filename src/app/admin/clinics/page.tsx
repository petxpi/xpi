"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminClinics() {
  const router = useRouter();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/admin/auth/check", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data.admin) {
        router.push("/admin/login");
        return;
      }

      setAdmin(data.admin);
      await loadClinics();
    } catch (error) {
      console.error("Error verificando auth:", error);
      router.push("/admin/login");
    }
  }

  async function loadClinics() {
    try {
      const response = await fetch("/api/admin/clinics", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setClinics(data.clinics || []);
      }
    } catch (error) {
      console.error("Error cargando clínicas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(clinicId: string, approved: number) {
    try {
      const response = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        await loadClinics();
      } else {
        alert("Error al actualizar la clínica");
      }
    } catch (error) {
      console.error("Error actualizando clínica:", error);
      alert("Error al actualizar la clínica");
    }
  }

  function openClinicDetails(clinic: any) {
    setSelectedClinic(clinic);
  }

  function closeClinicDetails() {
    setSelectedClinic(null);
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/admin/login");
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  }

  const filteredClinics = clinics.filter((clinic) => {
    const search = searchTerm.toLowerCase();
    return (
      clinic.name?.toLowerCase().includes(search) ||
      clinic.email?.toLowerCase().includes(search) ||
      clinic.city?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
          <p style={{ fontSize: "18px" }}>Cargando clínicas...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white" }}>
      {/* Header */}
      <header style={{ background: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px)", padding: "20px 32px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>🏥 Gestión de Clínicas</h1>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>
              {clinics.length} clínica(s) registrada(s)
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/admin/dashboard" style={{ padding: "10px 20px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px", textDecoration: "none", color: "white", fontSize: "14px" }}>
              ← Volver al Dashboard
            </Link>
            <button onClick={handleLogout} style={{ padding: "10px 20px", background: "rgba(239, 68, 68, 0.8)", borderRadius: "8px", border: "none", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {/* Buscador */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, email o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </div>

        {/* Lista de clínicas */}
        <div style={{ display: "grid", gap: "20px" }}>
          {filteredClinics.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255, 255, 255, 0.5)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
              <p style={{ fontSize: "18px" }}>No se encontraron clínicas</p>
            </div>
          ) : (
            filteredClinics.map((clinic) => (
              <div key={clinic.id} style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "24px",
                alignItems: "center",
              }}>
                {/* Logo */}
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {clinic.logo_url ? (
                    <img src={clinic.logo_url} alt={clinic.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "32px" }}>🏥</span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 8px 0" }}>{clinic.name}</h3>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
                    <span>📧 {clinic.email}</span>
                    <span>📱 {clinic.phone}</span>
                    <span>📍 {clinic.city}, {clinic.country}</span>
                    <span>💼 {clinic.specialty}</span>
                    <span>📋 Plan: {clinic.plan_type}</span>
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    Registrada: {new Date(clinic.created_at).toLocaleDateString('es-CO')}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    onClick={() => openClinicDetails(clinic)}
                    style={{
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.5)",
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Ver
                  </button>
                  {clinic.approved === 0 ? (
                    <button
                      onClick={() => handleApprove(clinic.id, 1)}
                      style={{
                        background: "rgba(34, 197, 94, 0.2)",
                        border: "1px solid rgba(34, 197, 94, 0.5)",
                        color: "#22c55e",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Aprobar
                    </button>
                  ) : (
                    <span style={{
                      background: "rgba(34, 197, 94, 0.2)",
                      color: "#22c55e",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}>
                      ✅ Aprobada
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal de detalles */}
      {selectedClinic && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "80vh",
            overflowY: "auto",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>🏥 Detalles de la Clínica</h2>
              <button
                onClick={closeClinicDetails}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>Nombre</div>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>{selectedClinic.name}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📧 Email</div>
                  <div style={{ fontSize: "16px" }}>{selectedClinic.email}</div>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📱 Teléfono</div>
                  <div style={{ fontSize: "16px" }}>{selectedClinic.phone}</div>
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📍 Dirección</div>
                <div style={{ fontSize: "16px" }}>{selectedClinic.address}, {selectedClinic.city}, {selectedClinic.country}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>💼 Especialidad</div>
                  <div style={{ fontSize: "16px" }}>{selectedClinic.specialty}</div>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📋 Plan</div>
                  <div style={{ fontSize: "16px", textTransform: "capitalize" }}>{selectedClinic.plan_type}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>⚡ Estado</div>
                  <div style={{ fontSize: "16px", color: selectedClinic.approved === 1 ? "#22c55e" : "#f59e0b", fontWeight: "bold", textTransform: "uppercase" }}>
                    {selectedClinic.approved === 1 ? "Aprobada" : "Pendiente"}
                  </div>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📅 Registro</div>
                  <div style={{ fontSize: "16px" }}>{new Date(selectedClinic.created_at).toLocaleDateString('es-CO')}</div>
                </div>
              </div>
              {selectedClinic.logo_url && (
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px" }}>🖼️ Logo</div>
                  <img src={selectedClinic.logo_url} alt={selectedClinic.name} style={{ maxWidth: "200px", borderRadius: "8px" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}