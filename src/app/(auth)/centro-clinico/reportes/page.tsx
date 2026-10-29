"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ReportesPage() {
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const clinicData = JSON.parse(localStorage.getItem("clinicData") || "{}");
    setClinicId(clinicData.id || "");
  }, []);

  useEffect(() => {
    if (clinicId) loadReports();
  }, [clinicId]);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?clinicId=${clinicId}`);
      const result = await res.json();
      console.log("Reportes:", result);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Cargando reportes...</div>;
  if (!data) return <div style={{padding: "40px", textAlign: "center"}}>No hay datos disponibles</div>;

  const totalCitas = data.appointmentsByStatus.reduce((sum: number, a: any) => sum + Number(a.total), 0);
  const citasPendientes = data.appointmentsByStatus.find((a: any) => a.status === "pending")?.total || 0;
  const citasCompletadas = data.appointmentsByStatus.find((a: any) => a.status === "completed")?.total || 0;

  return (
    <div style={{minHeight: "100vh", background: "#f9fafb"}}>
      {/* Header */}
      <div style={{background: "#7c3aed", padding: "24px 32px", color: "white"}}>
        <div style={{maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h1 style={{fontSize: "28px", fontWeight: "bold", margin: "0 0 4px 0"}}>Reportes y Estadísticas</h1>
            <p style={{margin: 0, opacity: 0.9}}>Resumen de la actividad de tu clínica</p>
          </div>
          <Link href="/centro-clinico/dashboard" style={{padding: "10px 20px", background: "white", color: "#7c3aed", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"}}>
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      <div style={{maxWidth: "1400px", margin: "0 auto", padding: "32px"}}>
        {/* KPIs */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px"}}>
          <KpiCard title="Total Pacientes" value={data.totalPatients} icon="🐾" color="#7c3aed" />
          <KpiCard title="Citas del Mes" value={data.monthAppointments} icon="📅" color="#3b82f6" />
          <KpiCard title="Citas Pendientes" value={citasPendientes} icon="" color="#f59e0b" />
          <KpiCard title="Vacunas por Vencer" value={data.expiringVaccines.length} icon="💉" color="#ef4444" />
        </div>

        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "32px"}}>
          {/* Distribución por Especie */}
          <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px"}}>Distribución por Especie</h2>
            {data.species.length > 0 ? (
              <div>
                {data.species.map((s: any, i: number) => {
                  const percentage = Math.round((Number(s.total) / data.totalPatients) * 100);
                  const colors = ["#7c3aed", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"];
                  return (
                    <div key={i} style={{marginBottom: "16px"}}>
                      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "6px"}}>
                        <span style={{fontWeight: "600", color: "#1f2937"}}>{s.species}</span>
                        <span style={{color: "#6b7280"}}>{s.total} ({percentage}%)</span>
                      </div>
                      <div style={{height: "12px", background: "#f3f4f6", borderRadius: "6px", overflow: "hidden"}}>
                        <div style={{width: `${percentage}%`, height: "100%", background: colors[i % colors.length], borderRadius: "6px", transition: "width 0.5s"}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{textAlign: "center", padding: "20px", color: "#6b7280"}}>Sin datos</div>
            )}
          </div>

          {/* Estado de Citas */}
          <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px"}}>Estado de Citas</h2>
            {totalCitas > 0 ? (
              <div>
                {data.appointmentsByStatus.map((a: any, i: number) => {
                  const percentage = Math.round((Number(a.total) / totalCitas) * 100);
                  const statusLabels: Record<string, string> = { pending: "Pendiente", completed: "Completada", cancelled: "Cancelada" };
                  const statusColors: Record<string, string> = { pending: "#f59e0b", completed: "#10b981", cancelled: "#ef4444" };
                  return (
                    <div key={i} style={{marginBottom: "16px"}}>
                      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "6px"}}>
                        <span style={{fontWeight: "600", color: "#1f2937"}}>{statusLabels[a.status] || a.status}</span>
                        <span style={{color: "#6b7280"}}>{a.total} ({percentage}%)</span>
                      </div>
                      <div style={{height: "12px", background: "#f3f4f6", borderRadius: "6px", overflow: "hidden"}}>
                        <div style={{width: `${percentage}%`, height: "100%", background: statusColors[a.status] || "#6b7280", borderRadius: "6px", transition: "width 0.5s"}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{textAlign: "center", padding: "30px", color: "#6b7280"}}>
                <div style={{fontSize: "48px", marginBottom: "12px"}}></div>
                <p style={{margin: 0}}>Aún no hay citas registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "32px"}}>
          {/* Vacunas por Vencer */}
          <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#ef4444", marginBottom: "20px"}}>Vacunas por Vencer (30 días)</h2>
            {data.expiringVaccines.length > 0 ? (
              <div style={{display: "grid", gap: "10px"}}>
                {data.expiringVaccines.map((v: any) => (
                  <div key={v.id} style={{padding: "12px", background: "#fef2f2", borderRadius: "8px", borderLeft: "4px solid #ef4444"}}>
                    <div style={{fontWeight: "bold", color: "#1f2937"}}>{v.pet_name}</div>
                    <div style={{fontSize: "13px", color: "#6b7280"}}>
                      {v.name} - Vence: {v.next_due_date}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign: "center", padding: "20px", color: "#6b7280"}}>
                <div style={{fontSize: "32px", marginBottom: "8px"}}>✅</div>
                No hay vacunas por vencer
              </div>
            )}
          </div>

          {/* Alergias Severas */}
          <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
            <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#ef4444", marginBottom: "20px"}}>Alergias Severas</h2>
            {data.severeAllergies.length > 0 ? (
              <div style={{display: "grid", gap: "10px"}}>
                {data.severeAllergies.map((a: any) => (
                  <div key={a.id} style={{padding: "12px", background: "#fef2f2", borderRadius: "8px", borderLeft: "4px solid #ef4444"}}>
                    <div style={{fontWeight: "bold", color: "#1f2937"}}>{a.pet_name}</div>
                    <div style={{fontSize: "13px", color: "#6b7280"}}>
                      {a.name} {a.notes && `- ${a.notes}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign: "center", padding: "20px", color: "#6b7280"}}>
                <div style={{fontSize: "32px", marginBottom: "8px"}}>✅</div>
                No hay alergias severas registradas
              </div>
            )}
          </div>
        </div>

        {/* Próximas Citas */}
        <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
          <h2 style={{fontSize: "20px", fontWeight: "bold", color: "#3b82f6", marginBottom: "20px"}}>Próximas Citas Pendientes</h2>
          {data.upcomingAppointments.length > 0 ? (
            <div style={{display: "grid", gap: "10px"}}>
              {data.upcomingAppointments.map((a: any) => (
                <div key={a.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
                  <div>
                    <div style={{fontWeight: "bold", color: "#1f2937"}}>{a.pet_name || a.client_name || "Paciente"}</div>
                    <div style={{fontSize: "13px", color: "#6b7280"}}>{a.appointment_date} {a.appointment_time && `a las ${a.appointment_time}`}</div>
                  </div>
                  <span style={{padding: "4px 10px", background: "#fef3c7", color: "#92400e", borderRadius: "12px", fontSize: "11px", fontWeight: "600"}}>Pendiente</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: "center", padding: "30px", color: "#6b7280"}}>
              <div style={{fontSize: "48px", marginBottom: "12px"}}>📋</div>
              No hay citas pendientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: `4px solid ${color}`}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"}}>
        <span style={{fontSize: "28px"}}>{icon}</span>
      </div>
      <div style={{fontSize: "32px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px"}}>{value}</div>
      <div style={{fontSize: "14px", color: "#6b7280"}}>{title}</div>
    </div>
  );
}