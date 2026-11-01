"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminData", JSON.stringify(data.admin));

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo decorativo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Contenedor circular con borde animado */}
      <div
        style={{
          position: "relative",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Borde animado azul */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            padding: "3px",
            background: "conic-gradient(from 0deg, transparent 0%, #3b82f6 50%, transparent 100%)",
            animation: "rotate 3s linear infinite",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#0f172a",
            }}
          />
        </div>

        {/* Contenido interior con efecto cristal */}
        <div
          style={{
            position: "relative",
            width: "460px",
            height: "460px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Ícono de administrador */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
            }}
          >
            ⚙️
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            Super Administrador
          </h1>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            Acceso restringido
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "20px",
                padding: "10px 20px",
                color: "#fca5a5",
                fontSize: "12px",
                marginBottom: "20px",
                textAlign: "center",
                width: "100%",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "11px",
                  fontWeight: "500",
                  marginBottom: "6px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  color: "white",
                  fontSize: "13px",
                  outline: "none",
                }}
                placeholder="admin@xpipet.com"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "11px",
                  fontWeight: "500",
                  marginBottom: "6px",
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  color: "white",
                  fontSize: "13px",
                  outline: "none",
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
                borderRadius: "20px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                marginTop: "8px",
              }}
            >
              {loading ? "Iniciando sesión..." : "INGRESAR"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <a
              href="/"
              style={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "11px",
                textDecoration: "none",
              }}
            >
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>

      {/* Animación CSS */}
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}