"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevaCitaPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    petId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "pending",
    notes: ""
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(data.id || "");
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadPatients();
      loadServices();
      loadStaff();
    }
  }, [clinicId]);

  async function loadPatients() {
    try {
      const res = await fetch(`/api/pets?clinicId=${clinicId}`);
      const data = await res.json();
      if (data.success) setPatients(data.pets || []);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    }
  }

  async function loadServices() {
    try {
      const res = await fetch(`/api/services?clinicId=${clinicId}`);
      const data = await res.json();
      if (data.success) setServices(data.services || []);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  }

  async function loadStaff() {
    try {
      const res = await fetch(`/api/staff?clinicId=${clinicId}`);
      const data = await res.json();
      if (data.success) setStaff(data.staff || []);
    } catch (error) {
      console.error("Error cargando personal:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          ...formData
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Cita creada correctamente");
        router.push("/centro-clinico/dashboard");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la cita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight: "100vh", background: "#f9fafb"}}>
      {/* Header */}
      <div style={{background: "#7c3aed", padding: "24px 32px", color: "white"}}>
        <div style={{maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h1 style={{fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0"}}>Nueva Cita</h1>
            <p style={{margin: 0, opacity: 0.9}}>Agendar una nueva consulta</p>
          </div>
          <Link href="/centro-clinico/dashboard" style={{padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"}}>
            ← Volver
          </Link>
        </div>
      </div>

      <div style={{maxWidth: "800px", margin: "0 auto", padding: "32px"}}>
        <form onSubmit={handleSubmit} style={{background: "white", borderRadius: "16px", padding: "32px"}}>
          
          {/* Mascota */}
          <div style={{marginBottom: "24px"}}>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Mascota *</label>
            <select 
              required 
              value={formData.petId} 
              onChange={(e) => setFormData({...formData, petId: e.target.value})}
              style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}
            >
              <option value="">Seleccionar mascota...</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} - {p.species} ({p.owner_name})</option>
              ))}
            </select>
          </div>

          {/* Servicio */}
          <div style={{marginBottom: "24px"}}>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Servicio *</label>
            <select 
              required 
              value={formData.serviceId} 
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}
            >
              <option value="">Seleccionar servicio...</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} - ${s.price} ({s.duration} min)</option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px"}}>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Fecha *</label>
              <input 
                type="date" 
                required 
                value={formData.appointmentDate} 
                onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}
              />
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Hora *</label>
              <input 
                type="time" 
                required 
                value={formData.appointmentTime} 
                onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}
              />
            </div>
          </div>

          {/* Notas */}
          <div style={{marginBottom: "24px"}}>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Notas adicionales</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={4}
              style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box", resize: "vertical"}}
              placeholder="Observaciones o comentarios adicionales..."
            />
          </div>

          {/* Botones */}
          <div style={{display: "flex", gap: "16px"}}>
            <Link href="/centro-clinico/dashboard" style={{flex: 1, padding: "14px", background: "#e5e7eb", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "bold"}}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              style={{flex: 2, padding: "14px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer"}}
            >
              {loading ? "Creando..." : "Crear Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
 
