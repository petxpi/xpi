"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PendientePage() {
  const [mounted, setMounted] = useState(false);
  const [clinicName, setClinicName] = useState("");

  useEffect(() => {
    setMounted(true);
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      const clinic = JSON.parse(clinicData);
      setClinicName(clinic.name || "Tu clínica");
    }
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f3e8ff 0%, #d1fae5 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "60px 40px", maxWidth: "500px", width: "100%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        
        <div style={{ fontSize: "80px", marginBottom: "24px" }}>⏳</div>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "16px" }}>
          Clínica en revisión
        </h1>
        <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.6", marginBottom: "32px" }}>
          <strong>{clinicName}</strong> ha sido registrada exitosamente y está pendiente de aprobación por el administrador.
          <br /><br />
          Recibirás un email cuando tu clínica sea activada.
        </p>

        <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "12px", marginBottom: "32px", border: "2px dashed #d1d5db" }}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>Estado actual</div>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "#fef3c7", color: "#92400e", borderRadius: "20px", fontWeight: "600", fontSize: "14px" }}>
            ⏳ Pendiente de aprobación
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#7c3aed",
              border: "2px solid #7c3aed",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Volver al inicio
          </Link>
          <Link
            href="/centro-clinico/login"
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  );
}