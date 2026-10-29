"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  owner_name: string;
  owner_phone: string;
  created_at: string;
}

export default function PacientesPage() {
  const [clinicId, setClinicId] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const clinicData = localStorage.getItem("clinicData");
    if (clinicData) {
      const data = JSON.parse(clinicData);
      setClinicId(data.id || data.clinicId || "");
    }
  }, []);

  useEffect(() => {
    if (!clinicId) return;
    fetchPets();
  }, [clinicId]);

  async function fetchPets() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pets?clinicId=${clinicId}`);
      const data = await res.json();
      if (data.success) {
        setPets(data.pets || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPets = pets.filter(pet => 
    pet.name.toLowerCase().includes(search.toLowerCase()) ||
    pet.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    pet.breed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#7c3aed", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0" }}>Pacientes</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Gestión de historiales clínicos de mascotas</p>
          </div>
          <Link 
            href="/centro-clinico/dashboard" 
            style={{ padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        
        {/* Barra de acciones */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, dueño o raza..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "300px", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px" }}
          />
          <Link
            href="/centro-clinico/pacientes/nuevo"
            style={{ padding: "12px 24px", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)" }}
          >
            + Registrar Nueva Mascota
          </Link>
        </div>

        {/* Lista de Pacientes */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#7c3aed" }}>Cargando pacientes...</div>
          ) : filteredPets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#6b7280" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🐾</div>
              <h4 style={{ color: "#374151", marginBottom: "8px" }}>No hay pacientes registrados</h4>
              <p>Comenzá registrando la primera mascota de tu clínica.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filteredPets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/centro-clinico/pacientes/${pet.id}`}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.3s ease",
                    background: "white"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "48px", height: "48px", background: "#f3e8ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                        {pet.species === "Gato" ? "🐱" : "🐶"}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>{pet.name}</h3>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>{pet.breed || "Raza no especificada"}</p>
                      </div>
                    </div>
                    <span style={{ padding: "4px 10px", background: pet.gender === "Macho" ? "#dbeafe" : "#fce7f3", color: pet.gender === "Macho" ? "#1e40af" : "#9d174d", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                      {pet.gender || "N/A"}
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>👤 Dueño: <strong style={{ color: "#1f2937" }}>{pet.owner_name}</strong></div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>📞 {pet.owner_phone}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}