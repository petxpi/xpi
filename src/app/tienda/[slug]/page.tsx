"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
  category: string;
}

interface Clinic {
  id: string;
  name: string;
  logo_url: string;
  business_image_url: string;
  specialty: string;
  address: string;
  city: string;
  country: string;
  phone: string;
}

export default function TiendaPublicaPage(props: { params: { slug: string } }) {
  const { slug } = props.params;
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/clinics/public/${slug}`, { cache: "no-store" });
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setClinic(data.clinic);
        setServices(data.services || []);
      } catch (error) {
        console.error("Error:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "24px", color: "#7c3aed", fontWeight: "bold" }}>Cargando...</div>
      </div>
    );
  }

  if (!clinic) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Banner - SIN overlay morado, imagen real */}
      {clinic.business_image_url && (
        <div style={{ position: "relative", height: "300px", overflow: "hidden" }}>
          <img
            src={clinic.business_image_url}
            alt={clinic.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "40px",
            marginTop: clinic.business_image_url ? "-80px" : "0",
            position: "relative",
            zIndex: 10,
          }}
        >
          {clinic.logo_url ? (
            <img
              src={clinic.logo_url}
              alt="Logo"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                objectFit: "cover",
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "60px",
                border: "4px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              🏥
            </div>
          )}
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>
              {clinic.name}
            </h1>
            {clinic.specialty && (
              <p style={{ fontSize: "18px", color: "#7c3aed", fontWeight: "600", margin: "0 0 8px 0" }}>
                {clinic.specialty}
              </p>
            )}
            {clinic.address && (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                📍 {clinic.address}{clinic.city && `, ${clinic.city}`}{clinic.country && `, ${clinic.country}`}
              </p>
            )}
            {clinic.phone && (
              <p style={{ fontSize: "14px", color: "#10b981", fontWeight: "600", margin: "4px 0 0 0" }}>
                 {clinic.phone}
              </p>
            )}
          </div>
        </div>

        {/* Servicios */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>
            Nuestros Servicios
          </h2>

          {services.length === 0 ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "60px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚕️</div>
              <h3 style={{ color: "#374151", marginBottom: "8px" }}>Aún no hay servicios disponibles</h3>
              <p style={{ color: "#6b7280" }}>Pronto agregaremos nuestros servicios</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {services.map((service) => (
                <div
                  key={service.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "2px solid #e5e7eb",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", margin: "0 0 4px 0" }}>
                        {service.name}
                      </h3>
                      {service.category && (
                        <span style={{ display: "inline-block", padding: "4px 10px", background: "#f3e8ff", color: "#7c3aed", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                          {service.category}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginLeft: "16px" }}>
                      ${parseFloat(service.price).toFixed(2)}
                    </div>
                  </div>

                  {service.description && (
                    <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.5", margin: "12px 0" }}>
                      {service.description}
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>⏱️ {service.duration_minutes} minutos</span>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowModal(true);
                      }}
                      style={{
                        padding: "10px 24px",
                        background: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 8px rgba(124, 58, 237, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#6d28d9";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#7c3aed";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px", color: "#6b7280", fontSize: "14px", borderTop: "2px solid #e5e7eb" }}>
          <p>Powered by <a href="https://xpi-pet.vercel.app" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: "700" }}>XpiPet</a> - Memoria de vida para tu mascota</p>
        </div>
      </div>

      {/* Modal de Agendamiento */}
      {showModal && selectedService && (
        <AppointmentModal
          service={selectedService}
          clinicId={clinic.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// Componente del Modal
function AppointmentModal({ service, clinicId, onClose }: { service: Service; clinicId: string; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    petName: "",
    notes: ""
  });

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const generateTimes = () => {
    const times = [];
    for (let hour = 8; hour < 18; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return times;
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    setTimeout(() => {
      setAvailableTimes(generateTimes().slice(0, 10));
      setLoading(false);
      setStep(2);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          serviceId: service.id,
          ...formData,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", maxWidth: "500px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>✅</div>
          <h2 style={{ color: "#10b981", fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>¡Cita Reservada!</h2>
          <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "24px" }}>
            Tu cita ha sido agendada exitosamente. Te enviaremos un recordatorio.
          </p>
          <div style={{ background: "#f3e8ff", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
            <p style={{ color: "#7c3aed", fontWeight: "600", margin: "4px 0" }}>📅 {new Date(selectedDate).toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p style={{ color: "#10b981", fontWeight: "700", fontSize: "20px", margin: "4px 0" }}>⏰ {selectedTime}</p>
          </div>
          <button onClick={onClose} style={{ padding: "12px 32px", background: "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "40px", maxWidth: "700px", width: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2 style={{ color: "#7c3aed", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Agendar Cita</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>{service.name} - ${parseFloat(service.price).toFixed(2)}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "32px", color: "#6b7280", cursor: "pointer", padding: "0 8px" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
          <div style={{ flex: 1, padding: "12px", background: step >= 1 ? "#7c3aed" : "#e5e7eb", borderRadius: "10px", textAlign: "center", color: step >= 1 ? "white" : "#6b7280", fontWeight: "600" }}>
            Paso 1: Fecha y Hora
          </div>
          <div style={{ flex: 1, padding: "12px", background: step >= 2 ? "#7c3aed" : "#e5e7eb", borderRadius: "10px", textAlign: "center", color: step >= 2 ? "white" : "#6b7280", fontWeight: "600" }}>
            Paso 2: Tus Datos
          </div>
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Selecciona una fecha</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              {generateDates().map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateChange(date)}
                  style={{
                    padding: "16px 12px",
                    background: selectedDate === date ? "#7c3aed" : "white",
                    color: selectedDate === date ? "white" : "#1f2937",
                    border: `2px solid ${selectedDate === date ? "#7c3aed" : "#e5e7eb"}`,
                    borderRadius: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDate !== date) {
                      e.currentTarget.style.borderColor = "#7c3aed";
                      e.currentTarget.style.color = "#7c3aed";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDate !== date) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.color = "#1f2937";
                    }
                  }}
                >
                  {new Date(date).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}
                </button>
              ))}
            </div>

            {loading && <p style={{ textAlign: "center", color: "#7c3aed", fontSize: "14px" }}>Cargando horarios disponibles...</p>}

            {!loading && selectedDate && (
              <div>
                <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Horarios disponibles</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        setStep(2);
                      }}
                      style={{
                        padding: "12px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#059669";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#10b981";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Nombre completo *</label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Teléfono *</label>
              <input
                type="tel"
                required
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Email</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Nombre de tu mascota *</label>
              <input
                type="text"
                required
                value={formData.petName}
                onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#1f2937", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>Notas adicionales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: "14px", background: "#e5e7eb", color: "#1f2937", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}
              >
                ← Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, padding: "14px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#10b981";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? "Procesando..." : "Confirmar Cita ✓"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}