"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

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
      await loadUsers();
    } catch (error) {
      console.error("Error verificando auth:", error);
      router.push("/admin/login");
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserPets(userId: string) {
    setLoadingPets(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/pets`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setUserPets(data.pets || []);
      }
    } catch (error) {
      console.error("Error cargando mascotas:", error);
    } finally {
      setLoadingPets(false);
    }
  }

  function openUserDetails(user: any) {
    setSelectedUser(user);
    loadUserPets(user.id);
  }

  function closeUserDetails() {
    setSelectedUser(null);
    setUserPets([]);
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

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
          <p style={{ fontSize: "18px" }}>Cargando usuarios...</p>
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
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>👥 Gestión de Usuarios</h1>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>
              {users.length} usuario(s) registrado(s)
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
            placeholder="🔍 Buscar por nombre o email..."
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

        {/* Tabla de usuarios */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0, 0, 0, 0.3)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>👤 Nombre</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>📧 Email</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>🐾 Mascotas</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>✅ Verificado</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>📅 Registro</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>⚡ Estado</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "14px", fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)" }}>🔍</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "16px", fontSize: "14px" }}>{user.name}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>{user.email}</td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{
                        background: user.pets_count > 0 ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.1)",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}>
                        {user.pets_count}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: "18px" }}>
                        {user.email_verified === 1 ? "✅" : "⏳"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "rgba(255, 255, 255, 0.7)" }}>
                      {new Date(user.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{
                        background: user.status === 'active' ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: user.status === 'active' ? "#22c55e" : "#ef4444",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button
                        onClick={() => openUserDetails(user)}
                        style={{
                          background: "rgba(59, 130, 246, 0.2)",
                          border: "1px solid rgba(59, 130, 246, 0.5)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de detalles */}
      {selectedUser && (
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
              <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>👤 Detalles del Usuario</h2>
              <button
                onClick={closeUserDetails}
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

            <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>Nombre</div>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>{selectedUser.name}</div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>Email</div>
                <div style={{ fontSize: "16px" }}>{selectedUser.email}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>Estado</div>
                  <div style={{ fontSize: "16px", color: selectedUser.status === 'active' ? "#22c55e" : "#ef4444", fontWeight: "bold", textTransform: "uppercase" }}>
                    {selectedUser.status}
                  </div>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>Registro</div>
                  <div style={{ fontSize: "16px" }}>{new Date(selectedUser.created_at).toLocaleDateString('es-CO')}</div>
                </div>
              </div>
              {selectedUser.phone && (
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📱 Teléfono</div>
                  <div style={{ fontSize: "16px" }}>{selectedUser.phone}</div>
                </div>
              )}
              {selectedUser.whatsapp && (
                <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>💬 WhatsApp</div>
                  <div style={{ fontSize: "16px" }}>{selectedUser.whatsapp}</div>
                </div>
              )}
            </div>

            {/* Mascotas del usuario */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
                🐾 Mascotas ({userPets.length})
              </h3>
              {loadingPets ? (
                <p style={{ color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>Cargando mascotas...</p>
              ) : userPets.length === 0 ? (
                <p style={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center", padding: "20px" }}>
                  Este usuario no tiene mascotas registradas
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {userPets.map((pet: any) => (
                    <div key={pet.id} style={{
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      padding: "16px",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "bold" }}>{pet.name}</div>
                        <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                          {pet.species} {pet.breed && `• ${pet.breed}`}
                        </div>
                      </div>
                      <span style={{
                        background: pet.status === 'home' ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: pet.status === 'home' ? "#22c55e" : "#ef4444",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}>
                        {pet.status === 'home' ? '🏠 En casa' : '🚨 Perdido'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}