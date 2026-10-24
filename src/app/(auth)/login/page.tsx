"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    console.log("🔐 BOTÓN PRESIONADO");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      console.log("✅ Login exitoso, redirigiendo...");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotate-slow {
          animation: rotate360 8s linear infinite !important;
        }
        .login-acrylic-card {
          background: rgba(255, 255, 255, 0.12) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        }
        .login-overlay {
          background: rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      <div 
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage: "url('/mascota1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay MUY ligero */}
        <div className="login-overlay" style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.08)",
        }} />

        {/* Tarjeta acrílica */}
        <div 
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "448px",
            margin: "0 16px",
            transform: "perspective(1500px) rotateX(8deg) rotateY(-3deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div 
            className="login-acrylic-card"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderRadius: "32px",
              padding: "48px 32px",
              border: "6px solid rgba(59, 130, 246, 0.95)",
              boxShadow: `
                0 0 0 3px rgba(147, 197, 253, 0.6),
                0 0 40px rgba(59, 130, 246, 0.9),
                0 0 80px rgba(59, 130, 246, 0.6),
                0 30px 60px rgba(0, 0, 0, 0.3),
                inset 0 2px 0 rgba(255,255,255,0.5)
              `,
              position: "relative",
              overflow: "hidden",
            }}
          >
            
            {/* Brillo superior */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
              borderRadius: "28px 28px 0 0",
              pointerEvents: "none",
            }} />

            {/* Logo giratorio */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", position: "relative" }}>
              <div className="rotate-slow" style={{ 
                position: "relative",
                width: "110px",
                height: "110px",
              }}>
                <div style={{
                  position: "absolute",
                  inset: "-10px",
                  background: "radial-gradient(circle, rgba(59,130,246,0.9) 0%, transparent 70%)",
                  borderRadius: "50%",
                }} />
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, rgba(96,165,250,0.9) 0%, rgba(37,99,235,0.9) 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "5px solid rgba(147, 197, 253, 0.95)",
                  boxShadow: "0 0 50px rgba(59,130,246,1), 0 0 100px rgba(59,130,246,0.7)",
                }}>
                  <img 
                    src="/xpipet-logo.png" 
                    alt="XpiPet" 
                    style={{ width: "70px", height: "70px", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 style={{
              fontSize: "32px",
              fontWeight: "bold",
              textAlign: "center",
              color: "white",
              marginBottom: "8px",
              textShadow: "0 0 20px rgba(59,130,246,0.9), 0 2px 4px rgba(0,0,0,0.5)",
              position: "relative",
            }}>
              BIENVENIDO A XPIPET
            </h1>
            <p style={{
              textAlign: "center",
              color: "#bfdbfe",
              marginBottom: "32px",
              fontSize: "14px",
              position: "relative",
            }}>
              Inicia sesión para continuar
            </p>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.25)",
                border: "2px solid rgba(239, 68, 68, 0.6)",
                borderRadius: "12px",
                padding: "12px",
                color: "#fecaca",
                fontSize: "14px",
                textAlign: "center",
                marginBottom: "24px",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
              
              {/* Email */}
              <div style={{ position: "relative" }}>
                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "3px solid rgba(147, 197, 253, 0.6)",
                  boxShadow: "inset 0 4px 10px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                }}>
                  <label style={{ display: "block", color: "#bfdbfe", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
                    Correo electrónico
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "white",
                        fontSize: "16px",
                      }}
                      placeholder="tu@email.com"
                    />
                    <svg style={{ width: "20px", height: "20px", color: "#93c5fd" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div style={{ position: "relative" }}>
                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "3px solid rgba(147, 197, 253, 0.6)",
                  boxShadow: "inset 0 4px 10px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                }}>
                  <label style={{ display: "block", color: "#bfdbfe", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
                    Contraseña
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "white",
                        fontSize: "16px",
                      }}
                      placeholder="••••••••"
                    />
                    <svg style={{ width: "20px", height: "20px", color: "#93c5fd" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Botón */}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "3px solid #93c5fd",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 10px 0 #1e3a8a, 0 15px 25px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.6), 0 0 40px rgba(59,130,246,0.7)",
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                {loading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
              </button>
            </div>

            <div style={{ marginTop: "24px", textAlign: "center", position: "relative" }}>
              <p style={{ color: "#bfdbfe", fontSize: "14px" }}>
                ¿No tienes cuenta?{" "}
                <Link href="/register" style={{ color: "#60a5fa", fontWeight: "600", textDecoration: "underline" }}>
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}