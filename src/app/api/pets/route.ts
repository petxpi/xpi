import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const petId = searchParams.get("petId");

    if (!clinicId) {
      return NextResponse.json({ message: "Falta clinicId" }, { status: 400 });
    }

    if (petId) {
      const petResult = await query(
        `SELECT * FROM clinic_patients WHERE id = ? AND clinic_id = ?`,
        [petId, clinicId]
      );
      const pet = (petResult.rows as any[])?.[0];

      if (!pet) {
        return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
      }

      const vaccines = await query(
        `SELECT * FROM clinic_vaccines WHERE pet_id = ? ORDER BY date_applied DESC`,
        [petId]
      );
      const allergies = await query(
        `SELECT * FROM clinic_allergies WHERE pet_id = ?`,
        [petId]
      );

      return NextResponse.json({
        success: true,
        pet: {
          ...pet,
          vaccines: vaccines.rows || [],
          allergies: allergies.rows || []
        }
      });
    }

    const result = await query(
      `SELECT id, name, species, breed, gender, owner_name, owner_phone, created_at
       FROM clinic_patients
       WHERE clinic_id = ?
       ORDER BY created_at DESC`,
      [clinicId]
    );

    return NextResponse.json({
      success: true,
      pets: result.rows || []
    });

  } catch (error: any) {
    console.error("Error al obtener mascotas:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clinicId, name, species, breed, gender, birthDate, weight,
      ownerName, ownerPhone, ownerEmail, photoUrl
    } = body;

    if (!clinicId || !name || !species || !ownerName || !ownerPhone) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO clinic_patients
       (id, clinic_id, name, species, breed, gender, birth_date, weight, photo_url, owner_name, owner_phone, owner_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, clinicId, name, species, breed || '', gender || '', birthDate || '', weight || null, photoUrl || '', ownerName, ownerPhone, ownerEmail || '']
    );

    return NextResponse.json({
      success: true,
      message: "Mascota registrada exitosamente",
      petId: id
    });

  } catch (error: any) {
    console.error("Error al crear mascota:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { petId, clinicId, name, species, breed, gender, birthDate, weight, ownerName, ownerPhone, ownerEmail, photoUrl } = body;

    if (!petId || !clinicId) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    await query(
      `UPDATE clinic_patients
       SET name = ?, species = ?, breed = ?, gender = ?, birth_date = ?, weight = ?,
           photo_url = ?, owner_name = ?, owner_phone = ?, owner_email = ?, updated_at = datetime('now')
       WHERE id = ? AND clinic_id = ?`,
      [name, species, breed || '', gender || '', birthDate || '', weight || null, photoUrl || '', ownerName, ownerPhone, ownerEmail || '', petId, clinicId]
    );

    return NextResponse.json({ success: true, message: "Mascota actualizada" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}