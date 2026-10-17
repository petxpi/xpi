import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XpiPet - Control de Mascotas",
  description: "Aplicación inteligente para el cuidado y seguimiento de la salud de tu mascota",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "XpiPet",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#9333ea" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[PWA] Service Worker registrado con éxito:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[PWA] Error al registrar Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}