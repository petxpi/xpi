"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("📤 Enviando registro:", { name, email, password });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log("📥 Respuesta del servidor:", response.status, data);

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar");
      }

      setSuccess("✅ Registro exitoso. Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error(" Error en registro:", err);
      setError(err.message || "Error al registrar");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 🖼️ Fondo de mascotas */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/mascota1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Tarjeta de acrílico flotante */}
      <div className="relative z-10 w-full max-w-md mx-4" style={{ perspective: "1000px" }}>
        <div 
          className="relative rounded-3xl p-8 transform hover:scale-105 transition-all duration-500"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
            backdropFilter: "blur(20px) saturate(200%)",
            WebkitBackdropFilter: "blur(20px) saturate(200%)",
            border: "2px solid rgba(255,255,255,0.4)",
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 80px rgba(59, 130, 246, 0.4),
              inset 0 1px 0 rgba(255,255,255,0.5),
              inset 0 -1px 0 rgba(255,255,255,0.2),
              inset 1px 0 0 rgba(255,255,255,0.3),
              inset -1px 0 0 rgba(255,255,255,0.3)
            `,
            transform: "rotateX(2deg)",
          }}
        >
          
          {/* Brillo superior del acrílico */}
          <div className="absolute top-0 left-0 right-0 h-32 rounded-t-3xl pointer-events-none"
               style={{
                 background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
               }}
          />

          {/* Brillo lateral izquierdo */}
          <div className="absolute top-0 left-0 bottom-0 w-32 rounded-l-3xl pointer-events-none"
               style={{
                 background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
               }}
          />

          {/* Logo con anillo azul neón */}
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-blue-300"
                   style={{
                     boxShadow: "0 0 40px rgba(59, 130, 246, 0.9), 0 0 80px rgba(59, 130, 246, 0.5), inset 0 2px 4px rgba(255,255,255,0.4)",
                   }}>
                <img 
                  src="/xpipet-logo.png" 
                  alt="XpiPet" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-white mb-2 drop-shadow-lg relative"
              style={{ textShadow: "0 2px 10px rgba(59, 130, 246, 0.5)" }}>
            CREAR CUENTA
          </h1>
          <p className="text-center text-blue-200 mb-8 text-sm relative">
            Únete a XpiPet y protege a tu mascota
          </p>

          {/* Formulario */}
          <form className="space-y-5 relative" onSubmit={onSubmit}>
            
            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3 text-green-200 text-sm text-center">
                {success}
              </div>
            )}

            {/* Nombre - Caja 3D en profundidad */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-blue-900/50 rounded-xl" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40"
                   style={{
                     boxShadow: `
                       inset 0 3px 6px rgba(0,0,0,0.4),
                       inset 0 -1px 0 rgba(255,255,255,0.3),
                       0 4px 8px rgba(0,0,0,0.2)
                     `,
                   }}>
                <label htmlFor="name" className="block text-blue-100 text-sm font-medium mb-2">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full bg-transparent border-none outline-none text-white placeholder-blue-200/50"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Email - Caja 3D en profundidad */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-blue-900/50 rounded-xl" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40"
                   style={{
                     boxShadow: `
                       inset 0 3px 6px rgba(0,0,0,0.4),
                       inset 0 -1px 0 rgba(255,255,255,0.3),
                       0 4px 8px rgba(0,0,0,0.2)
                     `,
                   }}>
                <label htmlFor="email" className="block text-blue-100 text-sm font-medium mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-transparent border-none outline-none text-white placeholder-blue-200/50"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña - Caja 3D en profundidad */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-blue-900/50 rounded-xl" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40"
                   style={{
                     boxShadow: `
                       inset 0 3px 6px rgba(0,0,0,0.4),
                       inset 0 -1px 0 rgba(255,255,255,0.3),
                       0 4px 8px rgba(0,0,0,0.2)
                     `,
                   }}>
                <label htmlFor="password" className="block text-blue-100 text-sm font-medium mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-transparent border-none outline-none text-white placeholder-blue-200/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón Register 3D en alto relieve */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur-lg opacity-80 group-hover:opacity-100 transition-opacity" />
              <div 
                className="relative bg-gradient-to-b from-blue-400 to-blue-600 text-white font-bold py-4 px-6 rounded-xl border-2 border-blue-300 transform group-hover:scale-105 transition-transform disabled:opacity-50"
                style={{
                  boxShadow: `
                    0 8px 0 #1e40af,
                    0 12px 15px rgba(0,0,0,0.4),
                    inset 0 2px 0 rgba(255,255,255,0.5),
                    inset 0 -2px 0 rgba(0,0,0,0.2)
                  `,
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                {loading ? "Creando cuenta..." : "CREAR CUENTA"}
              </div>
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center relative">
            <p className="text-blue-200 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Reflejo en el suelo */}
        <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-t from-blue-500/30 to-transparent blur-xl" />
      </div>
    </div>
  );
}