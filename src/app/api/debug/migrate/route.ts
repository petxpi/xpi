import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const migrations = [];
    const errors = [];

    // 1. Agregar columna status si no existe
    try {
      await query(`
        ALTER TABLE clinics ADD COLUMN status TEXT DEFAULT 'pending'
      `);
      migrations.push("✅ Columna 'status' agregada");
    } catch (err: any) {
      if (err.message.includes('duplicate column')) {
        migrations.push("ℹ️ Columna 'status' ya existe");
      } else {
        errors.push(`❌ Error en status: ${err.message}`);
      }
    }

    // 2. Agregar columnas adicionales
    const columnsToAdd = [
      { name: 'logo_url', type: 'TEXT' },
      { name: 'phone', type: 'TEXT' },
      { name: 'address', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'country', type: 'TEXT', default: "'Colombia'" },
      { name: 'block_reason', type: 'TEXT' },
      { name: 'block_date', type: 'TEXT' },
      { name: 'block_until', type: 'TEXT' },
      { name: 'plan_type', type: 'TEXT', default: "'free'" },
      { name: 'plan_expires', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      try {
        const defaultValue = col.default || 'NULL';
        await query(`
          ALTER TABLE clinics ADD COLUMN ${col.name} ${col.type} DEFAULT ${defaultValue}
        `);
        migrations.push(`✅ Columna '${col.name}' agregada`);
      } catch (err: any) {
        if (err.message.includes('duplicate column')) {
          migrations.push(`️ Columna '${col.name}' ya existe`);
        } else {
          errors.push(` Error en ${col.name}: ${err.message}`);
        }
      }
    }

    // 3. Crear tabla de auditoría si no existe
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS superadmin_actions (
          id TEXT PRIMARY KEY,
          clinic_id TEXT NOT NULL,
          action TEXT NOT NULL,
          reason TEXT,
          performed_by TEXT DEFAULT 'superadmin',
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
        )
      `);
      migrations.push("✅ Tabla 'superadmin_actions' creada");
    } catch (err: any) {
      errors.push(`❌ Error creando superadmin_actions: ${err.message}`);
    }

    // 4. Crear tabla de planes si no existe
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS clinic_plans (
          id TEXT PRIMARY KEY,
          clinic_id TEXT NOT NULL,
          plan_name TEXT NOT NULL,
          price REAL NOT NULL,
          duration_days INTEGER NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
        )
      `);
      migrations.push("✅ Tabla 'clinic_plans' creada");
    } catch (err: any) {
      errors.push(`❌ Error creando clinic_plans: ${err.message}`);
    }

    // 5. Activar la clínica de prueba
    try {
      await query(
        "UPDATE clinics SET status = 'active' WHERE email = ?",
        ["sistemdatos1@gmail.com"]
      );
      migrations.push("✅ Clínica de prueba activada");
    } catch (err: any) {
      errors.push(`⚠️ No se pudo activar la clínica (quizás no existe aún): ${err.message}`);
    }

    // 6. Verificar el estado final
    const checkResult = await query(
      "SELECT id, name, email, status FROM clinics WHERE email = ?",
      ["sistemdatos1@gmail.com"]
    );

    return NextResponse.json({
      migrations,
      errors: errors.length > 0 ? errors : [],
      clinicStatus: checkResult.rows || [],
      summary: {
        total: migrations.length + errors.length,
        success: migrations.length,
        failed: errors.length
      }
    });

  } catch (error: any) {
    console.error("Error en migración:", error);
    return NextResponse.json({ 
      error: "Error crítico en migración",
      details: String(error) 
    }, { status: 500 });
  }
}