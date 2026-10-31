import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

// ==========================================
// GET - Obtener mascotas (Soporta AMBOS: Centro Clínico y Usuario Común)
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const petId = searchParams.get("petId");

    // ==========================================
    // CASO 1: CENTRO CLÍNICO (tiene clinicId)
    // ==========================================
    if (clinicId) {
      if (petId) {
        // Obtener detalle de una mascota específica
        const petResult: any = await query(
          `SELECT * FROM clinic_patients WHERE id = ? AND clinic_id = ?`,
          [petId, clinicId]
        );
        const pet = (petResult.rows as any[])?.[0];
        if (!pet) return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });

        const vaccines = await query(`SELECT * FROM clinic_vaccines WHERE pet_id = ? ORDER BY date_applied DESC`, [petId]);
        const allergies = await query(`SELECT * FROM clinic_allergies WHERE pet_id = ?`, [petId]);

        return NextResponse.json({
          success: true,
          pet: { ...pet, vaccines: vaccines.rows || [], allergies: allergies.rows || [] }
        });
      }

      // Listar todas las mascotas de la clínica
      const result: any = await query(
        `SELECT id, name, species, breed, gender, owner_name, owner_phone, photo_url, created_at
         FROM clinic_patients WHERE clinic_id = ? ORDER BY created_at DESC`,
        [clinicId]
      );
      return NextResponse.json({ success: true, pets: result.rows || [] });
    }

    // ==========================================
    // CASO 2: USUARIO COMÚN (sin clinicId)
    // ==========================================
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado. Inicia sesión." }, { status: 401 });
    }

    // Decodificar JWT para obtener userId
    let userId: string;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userId = payload.userId as string;
    } catch (err) {
      console.error("Error al verificar token:", err);
      return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ message: "Usuario no encontrado en el token" }, { status: 401 });
    }

    // Consultar tabla pets del usuario común
    const petsResult: any = await query(
      `SELECT id, name, species, breed, color, sex, microchip, photo_url, public_id, status, lost_report, created_at 
       FROM pets WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ success: true, pets: petsResult.rows || [] });

  } catch (error: any) {
    console.error("Error al obtener mascotas:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

// ==========================================
// POST - Crear mascota (Soporta AMBOS)
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clinicId } = body;

    // ==========================================
    // CASO 1: CENTRO CLÍNICO
    // ==========================================
    if (clinicId) {
      const { name, species, breed, gender, birthDate, weight, ownerName, ownerPhone, ownerEmail, photoUrl } = body;
      if (!name || !species || !ownerName || !ownerPhone) {
        return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
      }

      const id = crypto.randomUUID();
      await query(
        `INSERT INTO clinic_patients
         (id, clinic_id, name, species, breed, gender, birth_date, weight, photo_url, owner_name, owner_phone, owner_email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [id, clinicId, name, species, breed || '', gender || '', birthDate || '', weight || null, photoUrl || '', ownerName, ownerPhone, ownerEmail || '']
      );

      return NextResponse.json({ success: true, message: "Mascota registrada exitosamente", petId: id });
    }

    // ==========================================
    // CASO 2: USUARIO COMÚN
    // ==========================================
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado. Inicia sesión." }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userId = payload.userId as string;
    } catch (err) {
      return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
    }

    const { name, species, breed, color, sex, microchip, photo } = body;
    if (!name || !species) {
      return NextResponse.json({ message: "Nombre y especie son obligatorios" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const publicId = crypto.randomUUID().split('-')[0].toUpperCase();

    await query(
      `INSERT INTO pets 
       (id, user_id, name, species, breed, color, sex, microchip, photo_url, public_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'home', datetime('now'))`,
      [id, userId, name, species, breed || null, color || null, sex || null, microchip || null, photo || null, publicId]
    );

    return NextResponse.json({ success: true, message: "Mascota creada", publicId });

  } catch (error: any) {
    console.error("Error al crear mascota:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

// ==========================================
// PUT - Actualizar mascota (Soporta AMBOS)
// ==========================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { clinicId, petId } = body;

    // ==========================================
    // CASO 1: CENTRO CLÍNICO
    // ==========================================
    if (clinicId && petId) {
      const { name, species, breed, gender, birthDate, weight, ownerName, ownerPhone, ownerEmail, photoUrl } = body;
      await query(
        `UPDATE clinic_patients
         SET name = ?, species = ?, breed = ?, gender = ?, birth_date = ?, weight = ?,
             photo_url = ?, owner_name = ?, owner_phone = ?, owner_email = ?, updated_at = datetime('now')
         WHERE id = ? AND clinic_id = ?`,
        [name, species, breed || '', gender || '', birthDate || '', weight || null, photoUrl || '', ownerName, ownerPhone, ownerEmail || '', petId, clinicId]
      );
      return NextResponse.json({ success: true, message: "Mascota actualizada" });
    }

    // ==========================================
    // CASO 2: USUARIO COMÚN
    // ==========================================
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token || !petId) {
      return NextResponse.json({ message: "No autorizado o falta petId" }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userId = payload.userId as string;
    } catch (err) {
      return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
    }

    const { name, species, breed, color, sex, microchip, photo } = body;

    await query(
      `UPDATE pets
       SET name = ?, species = ?, breed = ?, color = ?, sex = ?, microchip = ?, photo_url = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [name, species, breed || null, color || null, sex || null, microchip || null, photo || null, petId, userId]
    );

    return NextResponse.json({ success: true, message: "Mascota actualizada" });

  } catch (error: any) {
    console.error("Error al actualizar mascota:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

// ==========================================
// DELETE - Eliminar mascota (Soporta AMBOS)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const clinicId = searchParams.get("clinicId");

    // ==========================================
    // CASO 1: CENTRO CLÍNICO
    // ==========================================
    if (clinicId && petId) {
      await query(`DELETE FROM clinic_patients WHERE id = ? AND clinic_id = ?`, [petId, clinicId]);
      return NextResponse.json({ success: true, message: "Mascota eliminada" });
    }

    // ==========================================
    // CASO 2: USUARIO COMÚN
    // ==========================================
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token || !petId) {
      return NextResponse.json({ message: "No autorizado o falta petId" }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userId = payload.userId as string;
    } catch (err) {
      return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
    }

    await query(`DELETE FROM pets WHERE id = ? AND user_id = ?`, [petId, userId]);
    return NextResponse.json({ success: true, message: "Mascota eliminada" });

  } catch (error: any) {
    console.error("Error al eliminar mascota:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}