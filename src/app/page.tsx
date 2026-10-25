"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [colorIndex, setColorIndex] = useState(0);

  const colors = [
    "text-purple-500",
    "text-green-500",
    "text-blue-500",
    "text-pink-500",
    "text-yellow-400",
    "text-red-500",
    "text-cyan-400",
    "text-orange-500",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/xpipet-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black bg-opacity-30" />

      <div className="absolute top-4 left-4 z-10">
        <img src="/xpipet-logo.png" alt="Logo" className="w-16 h-16 object-contain" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-md">
        <h1
          className={`text-5xl md:text-6xl font-extrabold text-center mb-10 ${colors[colorIndex]} transition-colors duration-700`}
          style={{ textShadow: "3px 3px 10px rgba(0,0,0,0.9)" }}
        >
          Bienvenido
        </h1>

        <div className="w-full space-y-4 mb-10">
          <a
            href="/register"
            className="block w-full px-8 py-3 rounded-full border-2 border-purple-400 text-white font-semibold text-lg text-center hover:bg-purple-400 hover:text-gray-900 transition-all shadow-lg"
          >
            Explorar
          </a>
          <a
            href="/centro-clinico"
            className="block w-full px-8 py-3 rounded-full border-2 border-cyan-400 text-white font-semibold text-lg text-center hover:bg-cyan-400 hover:text-gray-900 transition-all shadow-lg"
          >
            Centro Clínico
          </a>
          <a
            href="/administrador/tracking"
            className="block w-full px-8 py-3 rounded-full border-2 border-green-400 text-white font-semibold text-lg text-center hover:bg-green-400 hover:text-gray-900 transition-all shadow-lg"
          >
            Administrador
          </a>
        </div>

        <p
          className="text-2xl md:text-3xl text-white font-semibold text-center"
          style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.9)" }}
        >
          XpiPet. Memoria de vida para tu mascota
        </p>
      </div>
    </div>
  );
}