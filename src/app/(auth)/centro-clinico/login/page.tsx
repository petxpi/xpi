"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CentroClinicoLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/clinics/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      localStorage.setItem("clinicToken", data.token);
      localStorage.setItem("clinicData", JSON.stringify(data.clinic));

      router.push("/centro-clinico/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      setLoading(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "url('/clinica.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div 
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          margin: "0 16px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "40px 32px",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          }}>🏥</div>
        </div>

        <h1 style={{
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "center",
          color: "#10b981",
          marginBottom: "8px",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}>
          CENTRO CLÍNICO
        </h1>
        <p style={{
          textAlign: "center",
          color: "white",
          marginBottom: "28px",
          fontSize: "14px",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}>
          Inicia sesión para gestionar tu clínica
        </p>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.3)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "8px",
            padding: "10px",
            color: "white",
            fontSize: "14px",
            textAlign: "center",
            marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "14px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}>
            <label style={{ display: "block", color: "white", fontSize: "13px", fontWeight: "500", marginBottom: "6px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "15px",
              }}
              placeholder="clinica@email.com"
            />
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "14px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}>
            <label style={{ display: "block", color: "white", fontSize: "13px", fontWeight: "500", marginBottom: "6px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "15px",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              background: "rgba(124, 58, 237, 0.9)",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Iniciando sesión..." : "INGRESAR"}
          </button>
        </div>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "13px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            ¿No tienes clínica?{" "}
            <Link href="/centro-clinico/register" style={{ color: "#10b981", fontWeight: "600", textDecoration: "underline" }}>
              Registra tu clínica
            </Link>
          </p>
          <p style={{ color: "white", fontSize: "13px", marginTop: "10px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            <Link href="/" style={{ color: "#c4b5fd", fontWeight: "600", textDecoration: "underline" }}>
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}