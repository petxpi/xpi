"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/found-reports/my");
        if (!response.ok) throw new Error("Error al cargar");
        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError("Error al cargar reportes");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  async function updateStatus(reportId: string, status: string) {
    try {
      const response = await fetch("/api/found-reports/my", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err) {
      alert("Error al actualizar el estado");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-purple-600 hover:underline mb-2 inline-block">
            ← Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">📋 Reportes de Mascotas Encontradas</h1>
          <p className="text-gray-600 mt-2">
            Aquí verás todos los reportes de personas que encontraron a tus mascotas.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No tienes reportes aún</p>
            <p className="text-gray-400 text-sm mt-2">
              Cuando alguien encuentre a tu mascota y envíe un reporte, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Reporte para: {report.pet_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID Público: {report.pet_public_id}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.status === 'pending' ? '⏳ Pendiente' :
                     report.status === 'contacted' ? '📞 Contactado' :
                     '✅ Resuelto'}
                  </span>
                </div>

                {report.photo_url && (
                  <div className="mb-4">
                    <img 
                      src={report.photo_url} 
                      alt="Foto del reporte" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Encontrador:</strong> {report.finder_name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Email:</strong> {report.finder_email}
                  </p>
                  {report.finder_phone && (
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Teléfono:</strong> {report.finder_phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    <strong>Mensaje:</strong> {report.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(report.id, 'contacted')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    📞 Marcar como Contactado
                  </button>
                  <button
                    onClick={() => updateStatus(report.id, 'resolved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    ✅ Marcar como Resuelto
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Recibido: {new Date(report.created_at).toLocaleString('es-CO')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}