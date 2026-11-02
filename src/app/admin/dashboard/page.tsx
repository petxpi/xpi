"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    clinics: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

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
      await loadStats();
    } catch (error) {
      console.error("Error verificando auth:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error cargando stats:", error);
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
          <p style={{ fontSize: "18px" }}>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white" }}>
      <header style={{ background: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px)", padding: "20px 32px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Panel de Super Administrador</h1>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>Bienvenido, {admin.name}</p>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/" style={{ padding: "10px 20px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px", textDecoration: "none", color: "white", fontSize: "14px" }}>
              ← Ir al sitio
            </Link>
            <button onClick={handleLogout} style={{ padding: "10px 20px", background: "rgba(239, 68, 68, 0.8)", borderRadius: "8px", border: "none", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}>📊 Estadísticas Globales</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px" }}>👥 Usuarios Registrados</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.users}</div>
          </div>
          <div style={{ background: "rgba(139, 92, 246, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px" }}>🐾 Mascotas Registradas</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.pets}</div>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px" }}>🏥 Clínicas Registradas</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.clinics}</div>
          </div>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px" }}>📅 Citas Agendadas</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.appointments}</div>
          </div>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}>🛠️ Módulos de Gestión</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          <Link href="/administrador/tracking" style={{ background: "rgba(139, 92, 246, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "2px solid rgba(139, 92, 246, 0.3)", textDecoration: "none", color: "white", transition: "all 0.3s", cursor: "pointer" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📍</div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", margin: "0 0 8px 0" }}>Panel GPS Global</h3>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>Monitorear mascotas con GPS en tiempo real</p>
            <div style={{ marginTop: "16px", fontSize: "12px", color: "#22c55e", fontWeight: "bold" }}>✅ FUNCIONAL</div>
          </Link>

          <Link href="/admin/users" style={{ background: "rgba(59, 130, 246, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "2px solid rgba(59, 130, 246, 0.3)", textDecoration: "none", color: "white", transition: "all 0.3s", cursor: "pointer" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", margin: "0 0 8px 0" }}>Gestión de Usuarios</h3>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 16px 0" }}>Ver y gestionar usuarios registrados y sus mascotas</p>
            <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "bold" }}>✅ FUNCIONAL</div>
          </Link>

          <Link href="/admin/clinics" style={{ background: "rgba(16, 185, 129, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "2px solid rgba(16, 185, 129, 0.3)", textDecoration: "none", color: "white", transition: "all 0.3s", cursor: "pointer" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", margin: "0 0 8px 0" }}>Gestión de Clínicas</h3>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 16px 0" }}>Aprobar, rechazar y gestionar clínicas veterinarias</p>
            <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "bold" }}>✅ FUNCIONAL</div>
          </Link>

          <div style={{ background: "rgba(239, 68, 68, 0.1)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "32px", border: "2px solid rgba(239, 68, 68, 0.3)", opacity: 0.7 }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", margin: "0 0 8px 0" }}>Gestión de Admins</h3>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 16px 0" }}>Crear y gestionar otros super administradores</p>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", fontStyle: "italic" }}>🔧 Próximamente</div>
          </div>
        </div>
      </main>
    </div>
  );
}