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
  const [petType, setPetType] = useState<"existing" | "new">("existing");
  const [formData, setFormData] = useState({
    petId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "scheduled",
    notes: "",
    // Mascota nueva
    newPetName: "",
    newPetSpecies: "Perro",
    newPetBreed: "",
    newOwnerName: "",
    newOwnerPhone: "",
    newOwnerEmail: ""
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(data.id || "");
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadPatients();
      loadServices();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          petId: petType === "existing" ? formData.petId : null,
          serviceId: formData.serviceId,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          status: formData.status,
          notes: formData.notes,
          newPetName: petType === "new" ? formData.newPetName : null,
          newPetSpecies: petType === "new" ? formData.newPetSpecies : null,
          newPetBreed: petType === "new" ? formData.newPetBreed : null,
          newOwnerName: petType === "new" ? formData.newOwnerName : null,
          newOwnerPhone: petType === "new" ? formData.newOwnerPhone : null,
          newOwnerEmail: petType === "new" ? formData.newOwnerEmail : null
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

          {/* Selector de tipo de mascota */}
          <div style={{marginBottom: "24px", padding: "16px", background: "#f3f4f6", borderRadius: "12px"}}>
            <label style={{display: "block", marginBottom: "12px", fontWeight: "bold", fontSize: "16px"}}>¿La mascota ya está registrada?</label>
            <div style={{display: "flex", gap: "16px"}}>
              <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                <input type="radio" name="petType" value="existing" checked={petType === "existing"} onChange={() => setPetType("existing")} />
                Mascota existente
              </label>
              <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                <input type="radio" name="petType" value="new" checked={petType === "new"} onChange={() => setPetType("new")} />
                Mascota nueva
              </label>
            </div>
          </div>

          {/* Mascota existente */}
          {petType === "existing" && (
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
          )}

          {/* Mascota nueva */}
          {petType === "new" && (
            <div style={{marginBottom: "24px", padding: "20px", background: "#fef3c7", borderRadius: "12px", border: "2px solid #f59e0b"}}>
              <h3 style={{margin: "0 0 16px 0", color: "#92400e"}}>Datos de la nueva mascota</h3>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                <div>
                  <label style={{display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "14px"}}>Nombre *</label>
                  <input required value={formData.newPetName} onChange={(e) => setFormData({...formData, newPetName: e.target.value})} style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
                </div>
                <div>
                  <label style={{display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "14px"}}>Especie *</label>
                  <select value={formData.newPetSpecies} onChange={(e) => setFormData({...formData, newPetSpecies: e.target.value})} style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}}>
                    <option>Perro</option>
                    <option>Gato</option>
                    <option>Ave</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "14px"}}>Raza</label>
                  <input value={formData.newPetBreed} onChange={(e) => setFormData({...formData, newPetBreed: e.target.value})} style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
                </div>
                <div>
                  <label style={{display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "14px"}}>Nombre del dueño *</label>
                  <input required value={formData.newOwnerName} onChange={(e) => setFormData({...formData, newOwnerName: e.target.value})} style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
                </div>
                <div>
                  <label style={{display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "14px"}}>Teléfono *</label>
                  <input required value={formData.newOwnerPhone} onChange={(e) => setFormData({...formData, newOwnerPhone: e.target.value})} style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
                </div>
                <div>
                  <label style={{display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "14px"}}>Email</label>
                  <input type="email" value={formData.newOwnerEmail} onChange={(e) => setFormData({...formData, newOwnerEmail: e.target.value})} style={{width: "100%", padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
                </div>
              </div>
            </div>
          )}

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
                <option key={s.id} value={s.id}>{s.name} - ${s.price} ({s.duration_minutes} min)</option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px"}}>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Fecha *</label>
              <input type="date" required value={formData.appointmentDate} onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
            </div>
            <div>
              <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Hora *</label>
              <input type="time" required value={formData.appointmentTime} onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box"}} />
            </div>
          </div>

          {/* Notas */}
          <div style={{marginBottom: "24px"}}>
            <label style={{display: "block", marginBottom: "8px", fontWeight: "bold"}}>Notas adicionales</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={4} style={{width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box", resize: "vertical"}} placeholder="Observaciones o comentarios adicionales..." />
          </div>

          {/* Botones */}
          <div style={{display: "flex", gap: "16px"}}>
            <Link href="/centro-clinico/dashboard" style={{flex: 1, padding: "14px", background: "#e5e7eb", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontWeight: "bold"}}>
              Cancelar
            </Link>
            <button type="submit" disabled={loading} style={{flex: 2, padding: "14px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer"}}>
              {loading ? "Creando..." : "Crear Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}