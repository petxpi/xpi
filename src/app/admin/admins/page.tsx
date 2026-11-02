"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminAdmins() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

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
      await loadAdmins();
    } catch (error) {
      console.error("Error verificando auth:", error);
      router.push("/admin/login");
    }
  }

  async function loadAdmins() {
    try {
      const response = await fetch("/api/admin/admins", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error("Error cargando admins:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setMessage("⚠️ Todos los campos son obligatorios");
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAdmin),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Admin creado exitosamente");
        setNewAdmin({ name: "", email: "", password: "" });
        setShowCreateModal(false);
        await loadAdmins();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Error al crear admin");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(adminId: string, currentActive: number) {
    const newActive = currentActive === 1 ? 0 : 1;
    const action = newActive === 1 ? "activar" : "desactivar";

    if (!confirm(`¿Estás seguro de ${action} este admin?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: newActive }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadAdmins();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error al actualizar admin");
    }
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
          <p style={{ fontSize: "18px" }}>Cargando administradores...</p>
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
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>⚙️ Gestión de Administradores</h1>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>
              {admins.length} administrador(es) registrado(s)
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
        {/* Botón crear nuevo admin */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => { setShowCreateModal(true); setMessage(""); }}
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              border: "none",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>➕</span>
            Crear Nuevo Admin
          </button>
        </div>

        {/* Mensaje */}
        {message && (
          <div style={{
            background: message.includes("✅") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.includes("✅") ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: message.includes("✅") ? "#22c55e" : "#ef4444",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            fontSize: "14px",
          }}>
            {message}
          </div>
        )}

        {/* Lista de admins */}
        <div style={{ display: "grid", gap: "20px" }}>
          {admins.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255, 255, 255, 0.5)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
              <p style={{ fontSize: "18px" }}>No hay administradores registrados</p>
            </div>
          ) : (
            admins.map((a) => (
              <div key={a.id} style={{
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
                {/* Avatar */}
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}>
                  {a.name?.charAt(0).toUpperCase() || "A"}
                </div>

                {/* Info */}
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 8px 0" }}>{a.name}</h3>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
                    <span>📧 {a.email}</span>
                    <span>👑 {a.role}</span>
                    <span>📅 {new Date(a.created_at).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {a.active === 1 ? (
                    <span style={{
                      background: "rgba(34, 197, 94, 0.2)",
                      color: "#22c55e",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}>
                      ✅ Activo
                    </span>
                  ) : (
                    <span style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}>
                      ❌ Inactivo
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleActive(a.id, a.active)}
                    style={{
                      background: a.active === 1 ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                      border: `1px solid ${a.active === 1 ? "rgba(239, 68, 68, 0.5)" : "rgba(34, 197, 94, 0.5)"}`,
                      color: a.active === 1 ? "#ef4444" : "#22c55e",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {a.active === 1 ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Crear Admin */}
      {showCreateModal && (
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
            maxWidth: "500px",
            width: "100%",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>➕ Crear Nuevo Admin</h2>
              <button
                onClick={() => { setShowCreateModal(false); setMessage(""); }}
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
              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@ejemplo.com"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  background: creating ? "rgba(139, 92, 246, 0.5)" : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  border: "none",
                  color: "white",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  cursor: creating ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {creating ? "Creando..." : "✅ Crear Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}