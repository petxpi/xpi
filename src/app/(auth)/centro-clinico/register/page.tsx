"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CentroClinicoRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!clinicName || !ownerName || !email || !password) {
      setError("Completa todos los campos obligatorios");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/clinics/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicName, ownerName, email, password, specialty }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar clínica");
      }

      // Guardar datos temporales para el siguiente paso
      localStorage.setItem("pendingClinic", JSON.stringify({
        clinicName, ownerName, email, specialty
      }));

      setSuccess("✅ Clínica registrada. Continuando con los datos...");
      setTimeout(() => {
        router.push("/centro-clinico/crear");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al registrar");
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "url('/clinica1.png')",
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
          maxWidth: "440px",
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
          REGISTRAR CLÍNICA
        </h1>
        <p style={{
          textAlign: "center",
          color: "white",
          marginBottom: "28px",
          fontSize: "14px",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}>
          Crea tu centro clínico veterinario
        </p>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.3)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: "8px",
              padding: "10px",
              color: "white",
              fontSize: "14px",
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "rgba(34, 197, 94, 0.3)",
              border: "1px solid rgba(34, 197, 94, 0.5)",
              borderRadius: "8px",
              padding: "10px",
              color: "white",
              fontSize: "14px",
              textAlign: "center",
            }}>
              {success}
            </div>
          )}

          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "14px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}>
            <label style={{ display: "block", color: "white", fontSize: "13px", fontWeight: "500", marginBottom: "6px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
              Nombre de la clínica *
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "15px",
              }}
              placeholder="Clínica Veterinaria XpiPet"
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
              Nombre del propietario *
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "15px",
              }}
              placeholder="Dr. Juan Pérez"
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
              Especialidad principal
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "15px",
              }}
              placeholder="Medicina general, Cirugía, etc."
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
              Correo electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              Contraseña *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
            type="submit"
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
            {loading ? "Registrando..." : "REGISTRAR CLÍNICA"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "13px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            ¿Ya tienes clínica?{" "}
            <Link href="/centro-clinico/login" style={{ color: "#10b981", fontWeight: "600", textDecoration: "underline" }}>
              Inicia sesión
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