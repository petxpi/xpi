import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación de admin
  const adminRoutes = ["/admin/dashboard", "/admin/users", "/admin/clinics", "/admin/admins"];

  // Verificar si la ruta requiere protección
  const requiresAuth = adminRoutes.some((route) => pathname.startsWith(route));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Obtener el token de admin
  const adminToken = request.cookies.get("admin-token")?.value;

  // Si no hay token, redirigir al login
  if (!adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Si hay token, permitir el acceso
  return NextResponse.next();
}

// Configurar qué rutas debe ejecutar el middleware
export const config = {
  matcher: ["/admin/:path*"],
};