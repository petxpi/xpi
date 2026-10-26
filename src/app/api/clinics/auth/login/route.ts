import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu-clave-secreta-super-segura";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const result = await query("SELECT * FROM clinics WHERE email = ?", [email]);
    
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const clinic = result.rows[0] as any;

    const isValid = await bcrypt.compare(password, clinic.password);
    if (!isValid) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    // Verificar estado de la clínica
    const status = clinic.status || 'pending';
    
    if (status === 'pending') {
      return NextResponse.json({ 
        message: "Tu clínica está pendiente de aprobación por el administrador",
        status: 'pending'
      }, { status: 403 });
    }

    if (status === 'suspended') {
      return NextResponse.json({ 
        message: `Tu clínica ha sido suspendida. Motivo: ${clinic.block_reason || 'No especificado'}`,
        status: 'suspended',
        blockDate: clinic.block_date,
        blockUntil: clinic.block_until
      }, { status: 403 });
    }

    if (status === 'blocked') {
      return NextResponse.json({ 
        message: `Tu clínica ha sido bloqueada. Motivo: ${clinic.block_reason || 'Falta de pago'}`,
        status: 'blocked',
        blockDate: clinic.block_date,
        blockUntil: clinic.block_until
      }, { status: 403 });
    }

    // Si está 'active', permitir login
    const token = jwt.sign(
      { clinicId: clinic.id, email: clinic.email, role: "clinic", status: status },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login exitoso",
      token,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        status: status,
        logo_url: clinic.logo_url,
        plan_type: clinic.plan_type,
      },
    });
  } catch (error) {
    console.error("Error en login de clínica:", error);
    return NextResponse.json({ message: "Error al iniciar sesión" }, { status: 500 });
  }
}