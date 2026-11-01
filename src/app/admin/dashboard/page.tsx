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
      {/* Header */}
      <header style={{ background: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px)", padding: "20px 32px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Panel de Super Administrador</h1>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", margin: "4px 0 0 0" }}>Bienvenido, {admin.name}</p>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/" style={{ padding