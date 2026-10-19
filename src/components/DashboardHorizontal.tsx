"use client";

import { useState } from "react";

interface DashboardHorizontalProps {
  pet: any;
  onVerPerfil: () => void;
  onVerQR: () => void;
  onEditar: () => void;
  onVerUbicacion: () => void;
  onVerHistorial: () => void;
  onVacunas: () => void;
  onVeterinario: () => void;
  onAlergias: () => void;
  onMedicacion: () => void;
  onHistorialMedico: () => void;
  onDesparasitaciones: () => void;
  onControlPeso: () => void;
  onCentroAlertas: () => void;
  onDiarioVida: () => void;
  onReportarPerdido: () => void;
  onEliminar: () => void;
}

const botones = [
  { id: "perfil", label: "👁️ Ver Perfil", color: "bg-purple-200 hover:bg-purple-300 text-purple-900 border-purple-400" },
  { id: "qr", label: "📱 Ver QR", color: "bg-cyan-200 hover:bg-cyan-300 text-cyan-900 border-cyan-400" },
  { id: "editar", label: "✏️ Editar", color: "bg-blue-200 hover:bg-blue-300 text-blue-900 border-blue-400" },
  { id: "ubicacion", label: "📍 Ubicación", color: "bg-green-200 hover:bg-green-300 text-green-900 border-green-400" },
  { id: "historial", label: "📜 Historial", color: "bg-indigo-200 hover:bg-indigo-300 text-indigo-900 border-indigo-400" },
  { id: "vacunas", label: "💉 Vacunas", color: "bg-teal-200 hover:bg-teal-300 text-teal-900 border-teal-400" },
  { id: "veterinario", label: "🩺 Veterinario", color: "bg-orange-200 hover:bg-orange-300 text-orange-900 border-orange-400" },
  { id: "alergias", label: "⚠️ Alergias", color: "bg-red-200 hover:bg-red-300 text-red-900 border-red-400" },
  { id: "medicacion", label: "💊 Medicación", color: "bg-pink-200 hover:bg-pink-300 text-pink-900 border-pink-400" },
  { id: "historialMedico", label: " Historial Médico", color: "bg-purple-200 hover:bg-purple-300 text-purple-900 border-purple-400" },
  { id: "desparasitaciones", label: "🦠 Desparasitaciones", color: "bg-emerald-200 hover:bg-emerald-300 text-emerald-900 border-emerald-400" },
  { id: "peso", label: "⚖️ Control de Peso", color: "bg-amber-200 hover:bg-amber-300 text-amber-900 border-amber-400" },
  { id: "alertas", label: " Centro de Alertas", color: "bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-400" },
  { id: "diario", label: "📔 Diario de Vida", color: "bg-yellow-200 hover:bg-yellow-300 text-yellow-900 border-yellow-400" },
  { id: "perdido", label: "🚨 Reportar Perdido", color: "bg-red-300 hover:bg-red-400 text-red-900 border-red-500" },
  { id: "eliminar", label: "🗑️ Eliminar", color: "bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-400" },
];

export default function DashboardHorizontal({
  pet,
  onVerPerfil,
  onVerQR,
  onEditar,
  onVerUbicacion,
  onVerHistorial,
  onVacunas,
  onVeterinario,
  onAlergias,
  onMedicacion,
  onHistorialMedico,
  onDesparasitaciones,
  onControlPeso,
  onCentroAlertas,
  onDiarioVida,
  onReportarPerdido,
  onEliminar,
}: DashboardHorizontalProps) {
  const [activeTab, setActiveTab] = useState("perfil");
  const [isOpen, setIsOpen] = useState(true);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleClick = (tabId: string) => {
    setActiveTab(tabId);
    setPressedButton(tabId);
    setTimeout(() => setPressedButton(null), 300);
    switch (tabId) {
      case "perfil": onVerPerfil(); break;
      case "qr": onVerQR(); break;
      case "editar": onEditar(); break;
      case "ubicacion": onVerUbicacion(); break;
      case "historial": onVerHistorial(); break;
      case "vacunas": onVacunas(); break;
      case "veterinario": onVeterinario(); break;
      case "alergias": onAlergias(); break;
      case "medicacion": onMedicacion(); break;
      case "historialMedico": onHistorialMedico(); break;
      case "desparasitaciones": onDesparasitaciones(); break;
      case "peso": onControlPeso(); break;
      case "alertas": onCentroAlertas(); break;
      case "diario": onDiarioVida(); break;
      case "perdido": onReportarPerdido(); break;
      case "eliminar": onEliminar(); break;
    }
  };

  const activeButton = botones.find(b => b.id === activeTab);

  return (
    <div className="flex min-h-[500px] border-t border-purple-200">
      {/*  Caja morada OSCURA - Menú lateral */}
      <div className={`bg-gradient-to-b from-purple-900 to-purple-950 transition-all duration-500 ease-in-out ${isOpen ? "w-64" : "w-16"} flex-shrink-0`}>
        
        {/*  Botón COLLAPSE (cerrar) - AZUL */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="w-full p-4 text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center font-semibold"
            style={{ boxShadow: "0 4px 0 #1e3a8a" }}
          >
            <span className="text-2xl">◀</span>
          </button>
        )}

        {/* 🟢 Botón EXPAND (abrir) - VERDE */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full p-4 text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center font-semibold"
            style={{ boxShadow: "0 4px 0 #14532d" }}
          >
            <span className="text-2xl">▶</span>
          </button>
        )}

        {/* Lista de botones 3D */}
        <div className="flex flex-col gap-2 p-2 max-h-[600px] overflow-y-auto">
          {botones.map((boton) => {
            const isPressed = pressedButton === boton.id;
            const isHovered = hoveredButton === boton.id;
            const isActive = activeTab === boton.id;

            return (
              <button
                key={boton.id}
                onClick={() => handleClick(boton.id)}
                onMouseEnter={() => setHoveredButton(boton.id)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`w-full px-4 py-3 rounded-lg border-2 font-semibold text-sm text-left ${boton.color} ${isOpen ? "block" : "hidden"}`}
                style={{
                  // Efecto 3D de alto relieve
                  transform: isPressed 
                    ? "translateY(4px) rotateY(0deg)" 
                    : isHovered 
                    ? "translateY(-2px) rotateY(360deg)" 
                    : "translateY(0) rotateY(0deg)",
                  // Sombra 3D (hundido al presionar)
                  boxShadow: isPressed 
                    ? "0 1px 0 rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)" 
                    : isActive
                    ? "0 6px 0 rgba(0,0,0,0.2), 0 8px 10px rgba(0,0,0,0.15)"
                    : "0 4px 0 rgba(0,0,0,0.2), 0 6px 8px rgba(0,0,0,0.1)",
                  // Borde inferior 3D
                  borderBottom: isPressed ? "2px solid transparent" : "4px solid rgba(0,0,0,0.15)",
                  // ⏱️ Transición MÁS LENTA para la rotación (2 segundos)
                  transition: "all 2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
              >
                <span className="inline-block" style={{
                  // ⏱️ Rotación del texto más lenta (2 segundos)
                  transform: isHovered ? "rotateY(360deg)" : "rotateY(0deg)",
                  transition: "transform 2s ease-in-out",
                }}>
                  {boton.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🖼️ Área de contenido con FOTO DE FONDO */}
      <div className="flex-1 relative overflow-hidden min-h-[500px]">
        
        {/* Foto de la mascota como fondo */}
        {pet.photo_url && !imageError ? (
          <img 
            src={pet.photo_url} 
            alt={pet.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center">
            <span className="text-9xl opacity-50">🐾</span>
          </div>
        )}

        {/* Overlay suave */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Textos flotantes */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          
          {/* Emoji grande animado */}
          <div className="text-9xl mb-6 drop-shadow-2xl animate-bounce">
            {activeButton?.label.split(" ")[0]}
          </div>

          {/* Título */}
          <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Sección activa: {activeButton?.label}
          </h3>

          {/* Nombre mascota */}
          <p className="text-2xl text-white mb-2 drop-shadow-md">
            Mascota: <span className="font-bold text-purple-300">{pet.name}</span>
          </p>

          {/* Especie y raza */}
          <p className="text-lg text-gray-200 mb-6 drop-shadow-md">
            {pet.species === "dog" ? "🐶 Perro" : pet.species === "cat" ? "🐱 Gato" : "🐾 Mascota"} 
            {pet.breed && ` • ${pet.breed}`}
          </p>

          {/* Instrucción glassmorphism */}
          <div className="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-40 rounded-2xl px-8 py-4 shadow-xl">
            <p className="text-white font-medium">
              Haz clic en cualquier botón del menú lateral para abrir su funcionalidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}