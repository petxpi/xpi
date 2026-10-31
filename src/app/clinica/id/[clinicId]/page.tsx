"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Clinic {
  id: string;
  name: string;
  logo_url: string;
  banner_url: string;
  primary_color: string;
  secondary_color: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  monday_open: string;
  monday_close: string;
  tuesday_open: string;
  tuesday_close: string;
  wednesday_open: string;
  wednesday_close: string;
  thursday_open: string;
  thursday_close: string;
  friday_open: string;
  friday_close: string;
  saturday_open: string;
  saturday_close: string;
  sunday_closed: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export default function PublicClinicByIdPage() {
  const params = useParams();
  const clinicId = params.clinicId as string;
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (clinicId) {
      loadClinic(clinicId);
    }
  }, [clinicId]);

  async function loadClinic(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/public/id/${id}`);
      const data = await res.json();
      if (data.clinic) {
        setClinic(data.clinic);
        if (data.services) {
          setServices(data.services);
        }
      }
    } catch (error) {
      console.error("Error cargando clínica:", error);
    } finally {
      setLoading(false);
    }
  }

  const schedule = [
    { day: "Lunes", open: clinic?.monday_open, close: clinic?.monday_close },
    { day: "Martes", open: clinic?.tuesday_open, close: clinic?.tuesday_close },
    { day: "Miércoles", open: clinic?.wednesday_open, close: clinic?.wednesday_close },
    { day: "Jueves", open: clinic?.thursday_open, close: clinic?.thursday_close },
    { day: "Viernes", open: clinic?.friday_open, close: clinic?.friday_close },
    { day: "Sábado", open: clinic?.saturday_open, close: clinic?.saturday_close },
    { day: "Domingo", open: clinic?.sunday_closed ? "Cerrado" : clinic?.monday_open, close: clinic?.sunday_closed ? "Cerrado" : clinic?.monday_close },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
          <p style={{ color: "#6b7280", fontSize: "18px" }}>Cargando clínica...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h1 style={{ fontSize: "24px", color: "#1f2937", marginBottom: "8px" }}>Clínica no encontrada</h1>
          <p style={{ color: "#6b7280" }}>La clínica que buscás no existe o no está disponible.</p>
          <Link href="/" style={{ display: "inline-block", marginTop: "24px", padding: "12px 24px", background: "#7c3aed", color: "white", textDecoration: "none", borderRadius: "10px", fontWeight: "bold" }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ position: "relative", height: "300px", background: clinic.banner_url ? `url(${clinic.banner_url}) center/cover` : clinic.primary_color }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "flex-end", gap: "24px" }}>
          {clinic.logo_url && (
            <img src={clinic.logo_url} alt={clinic.name} style={{ width: "120px", height: "120px", borderRadius: "20px", objectFit: "cover", border: "4px solid white", boxShadow: "0 8px 16px rgba(0,0,0,0.3)" }} />
          )}
          <div style={{ color: "white" }}>
            <h1 style={{ fontSize: "36px", fontWeight: "bold", margin: "0 0 8px 0", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{clinic.name}</h1>
            <p style={{ fontSize: "16px", margin: "0 0 4px 0", opacity: 0.9 }}>📍 {clinic.address}, {clinic.city}, {clinic.country}</p>
            <p style={{ fontSize: "14px", margin: 0, opacity: 0.8 }}>📞 {clinic.phone} | ✉️ {clinic.email}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        {clinic.description && (
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", marginBottom: "16px" }}>Sobre Nosotros</h2>
            <p style={{ fontSize: "16px", color: "#4b5563", lineHeight: 1.6 }}>{clinic.description}</p>
          </div>
        )}

        <div style={{ background: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>Nuestros Servicios</h2>
          {services.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>No hay servicios disponibles</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {services.map((service) => (
                <div key={service.id} style={{ padding: "24px", border: `2px solid ${clinic.primary_color}20`, borderRadius: "12px", background: "#f9fafb" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>{service.name}</h3>
                  {service.description && (
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 16px 0" }}>{service.description}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "24px", fontWeight: "bold", color: clinic.primary_color }}>
                      ${service.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>⏱️ {service.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>Horarios de Atención</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {schedule.map((item) => (
              <div key={item.day} style={{ padding: "16px", background: item.day === "Domingo" && clinic.sunday_closed ? "#fee2e2" : "#f9fafb", borderRadius: "10px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold", color: "#1f2937" }}>{item.day}</span>
                <span style={{ color: item.day === "Domingo" && clinic.sunday_closed ? "#991b1b" : "#6b7280" }}>
                  {item.open === "Cerrado" ? "Cerrado" : `${item.open} - ${item.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "32px" }}>
          <Link
            href={`/centro-clinico/citas/nueva?clinic=${clinic.id}`}
            style={{ display: "inline-block", padding: "20px 48px", background: clinic.primary_color, color: "white", textDecoration: "none", borderRadius: "12px", fontSize: "18px", fontWeight: "bold", boxShadow: `0 8px 16px ${clinic.primary_color}40` }}
          >
             Agendar Cita Ahora
          </Link>
        </div>
      </div>

      <footer style={{ background: "#1f2937", color: "white", padding: "32px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>© 2026 {clinic.name} - Todos los derechos reservados</p>
        <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: 0.6 }}>Powered by XpiPet</p>
      </footer>
    </div>
  );
}