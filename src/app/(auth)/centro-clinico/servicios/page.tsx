"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES = [
  "Consulta médica",
  "Especialidades",
  "Estética e higiene",
  "Bienestar y rehabilitación",
  "Exámenes y diagnóstico",
  "Procedimientos",
  "Cirugías",
];

const SPECIALTIES = [
  "Dermatología",
  "Ortopedia",
  "Nutrición",
  "Cardiología",
  "Neurología",
  "Oftalmología",
  "Odontología",
  "Oncología",
  "Medicina interna",
  "Etología",
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function ServiciosPage() {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [createdName, setCreatedName] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    specialty: "",
    schedule: DAYS.map((d) => ({ day: d, open: false, from: "08:00", to: "18:00" })),
    bookableOnline: true,
  });

  useEffect(() => {
    setMounted(true);
    loadServices();
  }, []);

  function loadServices() {
    const clinicData = localStorage.getItem("clinicData");
    if (!clinicData) return;
    const clinic = JSON.parse(clinicData);
    fetch(`/api/clinics/services?clinicId=${clinic.id}`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function handleCreateService() {
    const clinicData = localStorage.getItem("clinicData");
    if (!clinicData) {
      setMessage("No hay datos de clínica");
      return;
    }
    const clinic = JSON.parse(clinicData);

    const payload = {
      clinicId: clinic.id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      specialty: formData.specialty,
      schedule: formData.schedule,
      bookableOnline: formData.bookableOnline,
    };

    console.log("Enviando:", payload);

    fetch("/api/clinics/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta:", data);
        if (data.message && data.message.includes("exitosamente")) {
          setCreatedName(formData.name);
          loadServices();
        } else {
          setMessage(data.message || "Error al crear");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setMessage("Error de conexión");
      });
  }

  function resetAll() {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      specialty: "",
      schedule: DAYS.map((d) => ({ day: d, open: false, from: "08:00", to: "18:00" })),
      bookableOnline: true,
    });
    setStep(1);
    setCreatedName("");
    setShowForm(false);
    setMessage("");
  }

  function toggleDay(index: number) {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], open: !newSchedule[index].open };
    setFormData({ ...formData, schedule: newSchedule });
  }

  function updateTime(index: number, field: "from" | "to", value: string) {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  }

  if (!mounted) return null;

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: "", color: "purple", href: "/centro-clinico/dashboard" },
    { id: "agenda", name: "Agenda", icon: "📅", color: "green", href: "/centro-clinico/citas" },
    { id: "pacientes", name: "Pacientes", icon: "🐾", color: "purple", href: "/centro-clinico/pacientes" },
    { id: "servicios", name: "Servicios", icon: "⚕️", color: "green", href: "/centro-clinico/servicios", active: true },
    { id: "personal", name: "Personal", icon: "👥", color: "purple", href: "/centro-clinico/personal" },
    { id: "reportes", name: "Reportes", icon: "📈", color: "green", href: "/centro-clinico/reportes" },
  ];

  const getGreenColor = (isActive: boolean) => {
    if (isActive) return { bg: "#d1fae5", border: "#10b981", text: "#065f46" };
    return { bg: "transparent", border: "transparent", text: "#4b5563" };
  };

  const getPurpleColor = (isActive: boolean) => {
    if (isActive) return { bg: "#f3e8ff", border: "#7c3aed", text: "#6d28d9" };
    return { bg: "transparent", border: "transparent", text: "#4b5563" };
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "white",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex" }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: "250px",
        background: "white",
        borderRight: "1px solid #e5e7eb",
        padding: "20px 0",
        position: "fixed",
        height: "100vh",
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}>🏥</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#1f2937" }}>Centro Clínico</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Clínica Veterinaria</p>
            </div>
          </div>
        </div>

        <nav style={{ padding: "20px 0" }}>
          {menuItems.map((item) => {
            const colors = item.color === "green" ? getGreenColor(!!item.active) : getPurpleColor(!!item.active);
            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  textDecoration: "none",
                  background: colors.bg,
                  borderLeft: `4px solid ${colors.border}`,
                  fontSize: "14px",
                  fontWeight: item.active ? "600" : "400",
                  color: colors.text,
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid #e5e7eb", marginTop: "auto" }}>
          <Link href="/" style={{ display: "block", padding: "10px", textAlign: "center", color: "#6b7280", textDecoration: "none", fontSize: "13px" }}>
            ← Volver al inicio
          </Link>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ marginLeft: "250px", flex: 1, padding: "30px" }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>Servicios</h1>
            <p style={{ color: "#6b7280", margin: 0 }}>Gestiona los servicios médicos de tu clínica</p>
          </div>
          {!showForm && !createdName && (
            <button
              onClick={() => { resetAll(); setShowForm(true); }}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
              }}
            >
              + Nuevo Servicio
            </button>
          )}
        </header>

        {message && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #dc2626",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}>{message}</div>
        )}

        {/* WIZARD - PASO 1 */}
        {showForm && step === 1 && !createdName && (
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "2px solid #10b981" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <button onClick={() => resetAll()} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#7c3aed", padding: "4px 8px" }}>←</button>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: "#1f2937" }}>Crear nuevo servicio</h2>
            </div>

            <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", marginBottom: "32px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "50%", background: "linear-gradient(90deg, #7c3aed, #10b981)" }} />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px" }}>Información general</h3>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 24px 0" }}>Definir los datos básicos del nuevo servicio</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div>
                <label style={labelStyle}>Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Servicio *</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Seleccionar servicio</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Nombre del servicio *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Corte de pelo"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción breve del servicio"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Duración (minutos) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                onClick={() => {
                  if (!formData.name || !formData.price || !formData.duration || !formData.category) {
                    setMessage("Completa los campos obligatorios (*)");
                    return;
                  }
                  setMessage("");
                  setStep(2);
                }}
                style={{
                  padding: "14px 40px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
                }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* WIZARD - PASO 2 */}
        {showForm && step === 2 && !createdName && (
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "2px solid #10b981" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#7c3aed", padding: "4px 8px" }}>←</button>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: "#1f2937" }}>Crear nuevo servicio</h2>
            </div>

            <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", marginBottom: "32px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #7c3aed, #10b981)" }} />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>Horarios y configuración</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* HORARIOS */}
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>Horarios de atención</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {formData.schedule.map((day, idx) => (
                    <div key={day.day} style={{
                      padding: "14px 18px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      background: day.open ? "#f9fafb" : "white",
                    }}>
                      <input
                        type="checkbox"
                        checked={day.open}
                        onChange={() => toggleDay(idx)}
                        style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#7c3aed" }}
                      />
                      <span style={{ fontWeight: "600", color: "#1f2937", minWidth: "110px", fontSize: "15px" }}>{day.day}</span>
                      {day.open ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                          <input
                            type="time"
                            value={day.from}
                            onChange={(e) => updateTime(idx, "from", e.target.value)}
                            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                          />
                          <span style={{ color: "#6b7280", fontWeight: "500" }}>a</span>
                          <input
                            type="time"
                            value={day.to}
                            onChange={(e) => updateTime(idx, "to", e.target.value)}
                            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                          />
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: "14px", marginLeft: "auto" }}>Cerrado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* EMPLEADOS */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", margin: 0 }}>Empleados</h4>
                  <button style={{
                    padding: "8px 20px",
                    background: "white",
                    color: "#7c3aed",
                    border: "2px solid #7c3aed",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}>
                    Crear empleado
                  </button>
                </div>
                <select style={{ ...inputStyle, color: "#9ca3af" }}>
                  <option value="">Seleccionar empleados</option>
                </select>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px" }}>
                  Los empleados se podrán asignar una vez creado el módulo de Personal
                </p>
              </div>

              {/* RESERVABLE EN LÍNEA */}
              <div style={{
                padding: "18px",
                background: "#f9fafb",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb",
              }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "15px" }}>Reservable en línea</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px", maxWidth: "400px" }}>
                    Este servicio estará disponible para reservar en la página de agendamiento de las sedes seleccionadas, según los horarios y empleados configurados.
                  </div>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, bookableOnline: !formData.bookableOnline })}
                  style={{
                    width: "52px",
                    height: "28px",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    background: formData.bookableOnline ? "#7c3aed" : "#d1d5db",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "2px",
                    left: formData.bookableOnline ? "26px" : "2px",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            </div>

            {/* BOTONES FINALES */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", gap: "12px" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "14px 28px",
                  background: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Atrás
              </button>
              <button
                onClick={() => {
                  console.log("CLICK EN CREAR SERVICIO");
                  handleCreateService();
                }}
                style={{
                  padding: "14px 40px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
                  flex: 1,
                  maxWidth: "400px",
                }}
              >
                Crear Servicio
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA DE CONFIRMACIÓN */}
        {createdName && (
          <div style={{ background: "white", borderRadius: "12px", padding: "60px 32px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "2px solid #10b981" }}>
            <div style={{ fontSize: "100px", marginBottom: "24px" }}>🩺</div>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "12px" }}>
              {createdName} creado
            </h2>
            <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "40px" }}>
              El servicio de {createdName.toLowerCase()} ya está disponible para agendar en tu establecimiento
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button
                onClick={resetAll}
                style={{
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)",
                }}
              >
                Ver servicios
              </button>
              <button
                onClick={() => { setCreatedName(""); setShowForm(true); setStep(1); }}
                style={{
                  padding: "14px 32px",
                  background: "white",
                  color: "#7c3aed",
                  border: "2px solid #7c3aed",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Crear nuevo servicio
              </button>
            </div>
          </div>
        )}

        {/* LISTA DE SERVICIOS */}
        {!showForm && !createdName && (
          loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Cargando servicios...</div>
          ) : services.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", padding: "60px 24px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚕️</div>
              <h3 style={{ color: "#374151", marginBottom: "8px" }}>No hay servicios registrados</h3>
              <p style={{ color: "#6b7280" }}>Comienza creando tu primer servicio médico</p>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Servicio</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Categoría</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Precio</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Duración</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Estado</th>
                    <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px", fontWeight: "600", color: "#1f2937" }}>{service.name}</td>
                      <td style={{ padding: "16px", color: "#6b7280", fontSize: "14px" }}>{service.category || "—"}</td>
                      <td style={{ padding: "16px", fontWeight: "600", color: "#10b981" }}>${parseFloat(service.price.toString()).toFixed(2)}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>{service.duration_minutes} min</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: service.active === 1 ? "#d1fae5" : "#fee2e2",
                          color: service.active === 1 ? "#065f46" : "#dc2626",
                        }}>
                          {service.active === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <button
                          onClick={() => {
                            if (!confirm("¿Eliminar este servicio?")) return;
                            fetch(`/api/clinics/services?id=${service.id}`, { method: "DELETE" })
                              .then(() => loadServices())
                              .catch(() => setMessage("Error al eliminar"));
                          }}
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>
    </div>
  );
}