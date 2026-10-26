# Centro Clínico - Estado del Proyecto

## ✅ COMPLETADO
- [x] Splash con botón Centro Clínico (verde)
- [x] Login con verificación de estados
- [x] Registro de clínica
- [x] Crear clínica (datos completos)
- [x] Página "Pendiente de aprobación"
- [x] Dashboard básico con sidebar morado/verde
- [x] Módulo de Servicios (wizard 2 pasos)
  - Categorías (7 opciones)
  - Especialidades (10 opciones)
  - Horarios por día
  - Toggle "Reservable en línea"
  - Pantalla de confirmación
- [x] Tablas en Turso: clinics, clinic_services, clinic_staff, clinic_patients, clinic_appointments
- [x] Sistema de estados: pending/active/suspended/blocked
- [x] API endpoints: login, register, create, services (CRUD)

## 🔄 PENDIENTE (para retomar)
- [ ] Módulo de Personal (empleados, veterinarios)
- [ ] Módulo de Pacientes (mascotas atendidas)
- [ ] Módulo de Citas/Agenda (calendario)
- [ ] Módulo de Reportes
- [ ] Subida de logo de clínica (Cloudinary/R2)
- [ ] Página "Mi Clínica" (configuración)
- [ ] Sistema de suscripciones/planes
- [ ] Email de notificación al aprobar clínica
- [ ] Panel Superadmin (/admin) para gestionar clínicas
- [ ] Sistema de pagos para evitar bloqueos
- [ ] Multi-sede (varias sucursales por clínica)
- [ ] Permisos y roles dentro de la clínica

## 🏗️ ESTRUCTURA ACTUAL
src/app/(auth)/centro-clinico/
├── login/          ✅
├── register/       ✅
├── crear/          ✅
├── pendiente/      ✅
├── dashboard/      ✅
├── servicios/      ✅
├── personal/       ❌ (pendiente)
├── citas/          ❌ (pendiente)
├── pacientes/      ❌ (pendiente)
└── page.tsx        ✅ (redirect)

##  CREDENCIALES DE PRUEBA
- Email: sistemdatos1@gmail.com
- Para activar: UPDATE clinics SET status='active' WHERE email='sistemdatos1@gmail.com';

## 🎨 COLORES
- Morado: #7c3aed (botones principales, toggle)
- Verde brillante: #10b981 (acentos, precios, botón "+ Nuevo Servicio")

## 🚀 COMANDOS ÚTILES
- Dev: npm run dev
- Build: npm run build
- Deploy: git push (Vercel auto-deploy)