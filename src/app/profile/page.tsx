"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "", whatsapp: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/auth/me");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const userData = await response.json();
        setUser(userData.user);
        setEditData({
          name: userData.user?.name || "",
          phone: userData.user?.phone || "",
          whatsapp: userData.user?.whatsapp || "",
        });

        // Obtener mascotas del usuario
        const petsResponse = await fetch("/api/pets");
        if (petsResponse.ok) {
          const petsData = await petsResponse.json();
          setPets(petsData.pets || []);
        }
      } catch (err: any) {
        console.error("Error al cargar el perfil:", err);
        setError("Error al cargar el perfil. Por favor, inicia sesión nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  async function handleUpdateProfile() {
    setUpdating(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Perfil actualizado correctamente");
        setMessageType("success");
        setIsEditing(false);
        // Recargar datos
        const userResponse = await fetch("/api/auth/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("❌ Error al actualizar el perfil");
      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("❌ Las contraseñas no coinciden");
      setMessageType("error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("❌ La contraseña debe tener al menos 6 caracteres");
      setMessageType("error");
      return;
    }

    setUpdating(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Contraseña cambiada correctamente");
        setMessageType("success");
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("❌ Error al cambiar la contraseña");
      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  }

  function handleLogout() {
    document.cookie = "auth-token=; path=/; max-age=0";
    router.push("/login");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
          <p style={{ fontSize: "18px" }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "24px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
          <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>Error</p>
          <p style={{ marginBottom: "16px" }}>{error}</p>
          <Link href="/login" style={{ color: "#3b82f6", textDecoration: "underline", fontWeight: "bold" }}>
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "32px 16px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>👤 Mi Perfil</h1>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.8)",
              border: "none",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Mensaje */}
        {message && (
          <div style={{
            background: messageType === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${messageType === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: messageType === "success" ? "#22c55e" : "#ef4444",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}>
            {message}
          </div>
        )}

        {/* Información del Usuario */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}>📋 Información Personal</h2>
          
          {isEditing ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
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
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editData.whatsapp}
                    onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
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
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  style={{
                    background: updating ? "rgba(34, 197, 94, 0.5)" : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    border: "none",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: updating ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {updating ? "Guardando..." : " Guardar Cambios"}
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditData({ name: user?.name || "", phone: user?.phone || "", whatsapp: user?.whatsapp || "" }); }}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}> Nombre</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>{user?.name || "Sin nombre"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📧 Email</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>{user?.email || "Sin email"}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>📱 Teléfono</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{user?.phone || "No registrado"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>💬 WhatsApp</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{user?.whatsapp || "No registrado"}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  ✏️ Editar Perfil
                </button>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    border: "none",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  🔐 Cambiar Contraseña
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cambiar Contraseña */}
        {isChangingPassword && (
          <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}>🔐 Cambiar Contraseña</h2>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Ingresa tu contraseña actual"
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
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirma tu nueva contraseña"
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
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={handleChangePassword}
                  disabled={updating}
                  style={{
                    background: updating ? "rgba(139, 92, 246, 0.5)" : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    border: "none",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: updating ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {updating ? "Cambiando..." : "🔐 Cambiar Contraseña"}
                </button>
                <button
                  onClick={() => { setIsChangingPassword(false); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mis Mascotas */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>🐾 Mis Mascotas</h2>
            <Link
              href="/dashboard"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              + Agregar Mascota
            </Link>
          </div>

          {pets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🐶</div>
              <p style={{ fontSize: "18px", marginBottom: "16px", color: "rgba(255, 255, 255, 0.7)" }}>Aún no tienes mascotas registradas</p>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Ir al Dashboard para registrar
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pet/${pet.public_id || pet.id}`}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.3s",
                    textDecoration: "none",
                    color: "white",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>{pet.name}</h3>
                    <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
                      {pet.species || "Mascota"} • {pet.breed || "Raza no especificada"}
                    </p>
                    {pet.status === "lost" && (
                      <span style={{
                        display: "inline-block",
                        marginTop: "8px",
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#ef4444",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}>
                        🚨 PERDIDO
                      </span>
                    )}
                    {pet.status === "home" && (
                      <span style={{
                        display: "inline-block",
                        marginTop: "8px",
                        background: "rgba(34, 197, 94, 0.2)",
                        color: "#22c55e",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}>
                        ✅ En casa
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "24px" }}>→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Navegación rápida */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}>🔗 Navegación Rápida</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                textDecoration: "none",
                color: "white",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: "24px" }}>🏠</span>
              <span style={{ fontWeight: "bold" }}>Ir al Dashboard</span>
            </Link>
            <Link
              href="/profile/contact-settings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                textDecoration: "none",
                color: "white",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: "24px" }}>⚙️</span>
              <span style={{ fontWeight: "bold" }}>Configurar contacto público</span>
            </Link>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                textDecoration: "none",
                color: "white",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: "24px" }}></span>
              <span style={{ fontWeight: "bold" }}>Página principal</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px", color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>
          <p>Protegido por <strong style={{ color: "#8b5cf6" }}>XpiPet</strong> 🐾</p>
        </div>
      </div>
    </div>
  );
}