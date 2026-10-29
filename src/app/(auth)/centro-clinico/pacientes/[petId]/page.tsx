"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FichaPacientePage() {
  const params = useParams();
  const petId = params.petId as string;
  const [clinicId, setClinicId] = useState("");
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [newVaccine, setNewVaccine] = useState({ name: "", dateApplied: "", nextDueDate: "", notes: "" });
  const [newAllergy, setNewAllergy] = useState({ name: "", severity: "Leve", notes: "" });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clinicData") || "{}");
    const id = data.id || data.clinicId || "";
    console.log("clinicId desde localStorage:", id);
    setClinicId(id);
  }, []);

  useEffect(() => {
    console.log("useEffect ejecutado. clinicId:", clinicId, "petId:", petId);
    if (clinicId && petId) {
      loadPet();
    } else {
      setLoading(false);
    }
  }, [clinicId, petId]);

  async function loadPet() {
    console.log("=== INICIO loadPet ===");
    console.log("clinicId:", clinicId);
    console.log("petId:", petId);
    setLoading(true);

    try {
      const url = `/api/pets?clinicId=${clinicId}&petId=${petId}`;
      console.log("URL:", url);

      const res = await fetch(url);
      console.log("Status:", res.status);

      const data = await res.json();
      console.log("Data:", data);

      if (data.success) {
        setPet(data.pet);
        console.log("Mascota cargada:", data.pet.name);

        // Cargar historial de consultas
        try {
          const resConsultas = await fetch(`/api/appointments?clinicId=${clinicId}&petId=${petId}`);
          const dataConsultas = await resConsultas.json();
          console.log("Consultas:", dataConsultas);
          if (dataConsultas.success) {
            setConsultations(dataConsultas.appointments || []);
          }
        } catch (err) {
          console.error("Error cargando consultas:", err);
        }
      } else {
        console.error("Error del API:", data.message);
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error de fetch:", error);
      alert("Error de conexión: " + error);
    }

    setLoading(false);
    console.log("=== FIN loadPet ===");
  }

  async function addVaccine(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/vaccines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId, ...newVaccine })
    });
    setNewVaccine({ name: "", dateApplied: "", nextDueDate: "", notes: "" });
    setShowVaccineForm(false);
    loadPet();
  }

  async function addAllergy(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/allergies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId, ...newAllergy })
    });
    setNewAllergy({ name: "", severity: "Leve", notes: "" });
    setShowAllergyForm(false);
    loadPet();
  }

  async function deleteVaccine(id: string) {
    if (!confirm("¿Eliminar esta vacuna?")) return;
    await fetch("/api/vaccines", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    loadPet();
  }

  async function deleteAllergy(id: string) {
    if (!confirm("¿Eliminar esta alergia?")) return;
    await fetch("/api/allergies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    loadPet();
  }

  function calculateAge(birthDate: string) {
    if (!birthDate) return "Desconocida";
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years > 0) return `${years} año(s)`;
    if (months > 0) return `${months} mes(es)`;
    return "Recién nacido";
  }

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Cargando ficha...</div>;
  if (!pet) return <div style={{padding: "40px", textAlign: "center"}}>Paciente no encontrado</div>;

  return (
    <div style={{minHeight: "100vh", background: "#f9fafb"}}>
      {/* Header */}
      <div style={{background: "#7c3aed", padding: "24px 32px", color: "white"}}>
        <div style={{maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h1 style={{fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0"}}>Ficha Clínica</h1>
            <p style={{margin: 0, opacity: 0.9}}>{pet.name} - {pet.species}</p>
          </div>
          <div style={{display: "flex", gap: "10px"}}>
            <Link href={`/centro-clinico/pacientes/${petId}/editar`} style={{padding: "10px 20px", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"}}>
              Editar
            </Link>
            <Link href="/centro-clinico/pacientes" style={{padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"}}>
              ← Volver
            </Link>
          </div>
        </div>
      </div>

      <div style={{maxWidth: "1200px", margin: "0 auto", padding: "32px"}}>
        {/* Datos Básicos */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
          <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#7c3aed", marginBottom: "20px", borderBottom: "2px solid #f3e8ff", paddingBottom: "12px"}}>
            Datos del Paciente
          </h2>

          {pet.photo_url && (
            <div style={{textAlign: "center", marginBottom: "24px"}}>
              <img
                src={pet.photo_url}
                alt={pet.name}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #7c3aed",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
                }}
              />
            </div>
          )}

          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px"}}>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Nombre</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.name}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Especie</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.species}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Raza</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.breed || "No especificada"}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Sexo</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.gender || "No especificado"}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Edad</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{calculateAge(pet.birth_date)}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Peso</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.weight ? `${pet.weight} kg` : "No registrado"}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Dueño</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.owner_name}</div>
            </div>
            <div>
              <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>Teléfono</div>
              <div style={{fontSize: "16px", fontWeight: "bold", color: "#1f2937"}}>{pet.owner_phone}</div>
            </div>
          </div>
        </div>

        {/* Vacunas */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #d1fae5", paddingBottom: "12px"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#10b981", margin: 0}}>Vacunas</h2>
            <button onClick={() => setShowVaccineForm(!showVaccineForm)} style={{padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"}}>
              {showVaccineForm ? "Cancelar" : "+ Agregar Vacuna"}
            </button>
          </div>

          {showVaccineForm && (
            <form onSubmit={addVaccine} style={{background: "#f0fdf4", padding: "20px", borderRadius: "12px", marginBottom: "20px"}}>
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px"}}>
                <input type="text" placeholder="Nombre de la vacuna" required value={newVaccine.name} onChange={(e) => setNewVaccine({...newVaccine, name: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}} />
                <input type="date" required value={newVaccine.dateApplied} onChange={(e) => setNewVaccine({...newVaccine, dateApplied: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}} />
                <input type="date" value={newVaccine.nextDueDate} onChange={(e) => setNewVaccine({...newVaccine, nextDueDate: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}} />
                <input type="text" placeholder="Notas" value={newVaccine.notes} onChange={(e) => setNewVaccine({...newVaccine, notes: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}} />
              </div>
              <button type="submit" style={{marginTop: "12px", padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"}}>Guardar Vacuna</button>
            </form>
          )}

          {pet.vaccines && pet.vaccines.length > 0 ? (
            <div style={{display: "grid", gap: "12px"}}>
              {pet.vaccines.map((v: any) => (
                <div key={v.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
                  <div>
                    <div style={{fontWeight: "bold", color: "#1f2937"}}>{v.name}</div>
                    <div style={{fontSize: "13px", color: "#6b7280"}}>Aplicada: {v.date_applied} {v.next_due_date && `| Próxima: ${v.next_due_date}`}</div>
                    {v.notes && <div style={{fontSize: "12px", color: "#9ca3af"}}>{v.notes}</div>}
                  </div>
                  <button onClick={() => deleteVaccine(v.id)} style={{padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px"}}>Eliminar</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: "center", padding: "20px", color: "#6b7280"}}>No hay vacunas registradas</div>
          )}
        </div>

        {/* Alergias */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #fee2e2", paddingBottom: "12px"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#ef4444", margin: 0}}>Alergias</h2>
            <button onClick={() => setShowAllergyForm(!showAllergyForm)} style={{padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"}}>
              {showAllergyForm ? "Cancelar" : "+ Agregar Alergia"}
            </button>
          </div>

          {showAllergyForm && (
            <form onSubmit={addAllergy} style={{background: "#fef2f2", padding: "20px", borderRadius: "12px", marginBottom: "20px"}}>
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px"}}>
                <input type="text" placeholder="Nombre de la alergia" required value={newAllergy.name} onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}} />
                <select value={newAllergy.severity} onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}}>
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Severa">Severa</option>
                </select>
                <input type="text" placeholder="Notas" value={newAllergy.notes} onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})} style={{padding: "10px", border: "2px solid #e5e7eb", borderRadius: "8px"}} />
              </div>
              <button type="submit" style={{marginTop: "12px", padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"}}>Guardar Alergia</button>
            </form>
          )}

          {pet.allergies && pet.allergies.length > 0 ? (
            <div style={{display: "grid", gap: "12px"}}>
              {pet.allergies.map((a: any) => (
                <div key={a.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
                  <div>
                    <div style={{fontWeight: "bold", color: "#1f2937"}}>{a.name}</div>
                    <div style={{fontSize: "13px"}}>
                      <span style={{padding: "2px 8px", background: a.severity === "Severa" ? "#fee2e2" : a.severity === "Moderada" ? "#fef3c7" : "#d1fae5", color: a.severity === "Severa" ? "#991b1b" : a.severity === "Moderada" ? "#92400e" : "#065f46", borderRadius: "12px", fontSize: "11px", fontWeight: "600", marginRight: "8px"}}>{a.severity}</span>
                      {a.notes && <span style={{color: "#6b7280"}}>{a.notes}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteAllergy(a.id)} style={{padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px"}}>Eliminar</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: "center", padding: "20px", color: "#6b7280"}}>No hay alergias registradas</div>
          )}
        </div>

        {/* Historial de Consultas */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #dbeafe", paddingBottom: "12px"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#3b82f6", margin: 0}}>Historial de Consultas</h2>
          </div>

          {consultations.length > 0 ? (
            <div style={{display: "grid", gap: "12px"}}>
              {consultations.map((c: any) => (
                <div key={c.id} style={{padding: "16px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px"}}>
                    <div>
                      <div style={{fontWeight: "bold", color: "#1f2937", fontSize: "15px"}}>{c.service_id || "Consulta"}</div>
                      <div style={{fontSize: "13px", color: "#6b7280"}}>{c.appointment_date}</div>
                    </div>
                    <span style={{
                      padding: "4px 10px",
                      background: c.status === "completed" ? "#d1fae5" : c.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                      color: c.status === "completed" ? "#065f46" : c.status === "cancelled" ? "#991b1b" : "#92400e",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}>
                      {c.status === "completed" ? "Completada" : c.status === "cancelled" ? "Cancelada" : "Pendiente"}
                    </span>
                  </div>
                  {c.diagnosis && (
                    <div style={{marginTop: "8px", padding: "8px", background: "white", borderRadius: "6px", fontSize: "13px"}}>
                      <strong style={{color: "#3b82f6"}}>Diagnóstico:</strong> {c.diagnosis}
                    </div>
                  )}
                  {c.notes && (
                    <div style={{marginTop: "8px", padding: "8px", background: "white", borderRadius: "6px", fontSize: "13px"}}>
                      <strong style={{color: "#6b7280"}}>Notas:</strong> {c.notes}
                    </div>
                  )}
                  {c.vet_name && (
                    <div style={{marginTop: "8px", fontSize: "12px", color: "#6b7280"}}>
                      Atendido por: <strong>{c.vet_name}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: "center", padding: "20px", color: "#6b7280"}}>No hay consultas registradas</div>
          )}
        </div>
      </div>
    </div>
  );
}