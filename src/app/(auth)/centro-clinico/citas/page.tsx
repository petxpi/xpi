"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CitasPage() {
  const [clinicId, setClinicId] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(data.id || "");
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadAppointments();
    }
  }, [clinicId]);

  async function loadAppointments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?clinicId=${clinicId}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAppointment(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta cita?")) return;

    try {
      const res = await fetch(`/api/appointments/${id}?clinicId=${clinicId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        alert("Cita eliminada");
        loadAppointments();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error eliminando cita:", error);
      alert("Error al eliminar la cita");
    }
  }

  async function confirmAppointment(id: string) {
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          clinicId,
          status: "confirmed"
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Cita confirmada");
        loadAppointments();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error confirmando cita:", error);
      alert("Error al confirmar la cita");
    }
  }

  const filteredAppointments = appointments.filter((apt: any) => {
    if (filterDate && !apt.appointment_date?.startsWith(filterDate)) return false;
    if (filterStatus !== "all" && apt.status !== filterStatus) return false;
    return true;
  });

  function formatDate(dateStr: string) {
    if (!dateStr) return "Sin fecha";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-CO");
    } catch {
      return dateStr;
    }
  }

  function formatPrice(price: number) {
    if (!price && price !== 0) return "$0";
    return `$${price.toLocaleString("es-CO")}`;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div style={{minHeight: "100vh", background: "#f9fafb"}}>
      <div style={{background: "#7c3aed", padding: "24px 32px", color: "white"}}>
        <div style={{maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h1 style={{fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0"}}>Agenda de Citas</h1>
            <p style={{margin: 0, opacity: 0.9}}>Gestiona las citas de tu clínica</p>
          </div>
          <Link href="/centro-clinico/citas/nueva" style={{padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"}}>
            + Nueva Cita
          </Link>
        </div>
      </div>

      <div style={{maxWidth: "1200px", margin: "0 auto", padding: "32px"}}>
        {/* Filtros */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px"}}>
          <h3 style={{margin: "0 0 16px 0", fontSize: "18px", fontWeight: "bold"}}>Filtros</h3>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px"}}>Fecha (opcional)</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}
              />
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px"}}>Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de citas */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px"}}>
          <h3 style={{margin: "0 0 16px 0", fontSize: "18px", fontWeight: "bold"}}>
            Citas ({filteredAppointments.length})
          </h3>

          {loading ? (
            <p style={{textAlign: "center", padding: "40px", color: "#6b7280"}}>Cargando citas...</p>
          ) : filteredAppointments.length === 0 ? (
            <p style={{textAlign: "center", padding: "40px", color: "#6b7280"}}>No hay citas registradas</p>
          ) : (
            <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
              {filteredAppointments.map((apt: any) => (
                <div key={apt.id} style={{border: "2px solid #e5e7eb", borderRadius: "12px", padding: "20px"}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px"}}>
                    <div>
                      <p style={{margin: "0 0 8px 0", fontWeight: "bold", fontSize: "16px"}}>
                        🐾 Mascota: {apt.pet_name || "Sin nombre"}
                      </p>
                      {apt.service_name && (
                        <p style={{margin: "0 0 8px 0", color: "#6b7280"}}>
                           Servicio: {apt.service_name}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                      background: apt.status === "confirmed" ? "#d1fae5" : apt.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                      color: apt.status === "confirmed" ? "#065f46" : apt.status === "cancelled" ? "#991b1b" : "#92400e"
                    }}>
                      {apt.status}
                    </span>
                  </div>

                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px"}}>
                    <div>
                      <p style={{margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280"}}>📅 Fecha</p>
                      <p style={{margin: 0, fontWeight: "bold"}}>{formatDate(apt.appointment_date)}</p>
                    </div>
                    <div>
                      <p style={{margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280"}}>🕐 Hora</p>
                      <p style={{margin: 0, fontWeight: "bold"}}>{apt.appointment_time || "No especificada"}</p>
                    </div>
                    {apt.price && (
                      <div>
                        <p style={{margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280"}}>💰 Precio</p>
                        <p style={{margin: 0, fontWeight: "bold", color: "#10b981"}}>{formatPrice(apt.price)}</p>
                      </div>
                    )}
                  </div>

                  <div style={{display: "flex", gap: "8px", justifyContent: "flex-end"}}>
                    {apt.status !== "confirmed" && (
                      <button
                        onClick={() => confirmAppointment(apt.id)}
                        style={{
                          padding: "8px 16px",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        ✓ Confirmar
                      </button>
                    )}
                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      style={{
                        padding: "8px 16px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}