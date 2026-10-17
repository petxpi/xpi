"use client";

import { useState, useEffect } from "react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Verificar si ya está instalada
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Escuchar el evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Escuchar cuando se instala
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setInstalled(true);
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  // Si ya está instalada, no mostrar nada
  if (installed) return null;

  // Si es iOS, mostrar instrucciones especiales
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-pulse">
          <div className="text-3xl">📱</div>
          <div className="flex-1">
            <p className="font-bold text-sm">¡Instala XpiPet!</p>
            <p className="text-xs opacity-90">
              En iPhone: toca <strong>Compartir</strong> → <strong>Agregar a pantalla de inicio</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay soporte para instalación, no mostrar nada
  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-auto">
      <button
        onClick={handleInstallClick}
        className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl px-6 py-3 flex items-center justify-center gap-3 hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
      >
        <div className="text-2xl">📱</div>
        <div className="text-left">
          <p className="font-bold text-sm">Instalar XpiPet</p>
          <p className="text-xs opacity-90">Como app en tu dispositivo</p>
        </div>
        <div className="text-xl ml-2">⬇️</div>
      </button>
    </div>
  );
}