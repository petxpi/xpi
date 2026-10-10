import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { petId, finderName, finderEmail, finderPhone, description, photoUrl, lat, lng } = body;

    console.log("📝 Nuevo reporte de mascota encontrada:", { petId, finderName });

    // 1. Validar campos obligatorios
    if (!petId || !finderName || !finderEmail || !description) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // 2. Buscar la mascota por public_id O id interno
    const petResult = await db.execute(
      `SELECT id, name, user_id FROM pets WHERE public_id = ? OR id = ?`,
      [petId, petId]
    );

    if (petResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Mascota no encontrada con el ID proporcionado" },
        { status: 404 }
      );
    }

    const pet = petResult.rows[0] as any;
    const realPetId = pet.id;

    // 3. Generar ID único
    const reportId = crypto.randomUUID();

    // 4. Guardar reporte en la base de datos con el ID real
    await db.execute(
      `INSERT INTO found_reports (id, pet_id, finder_name, finder_email, finder_phone, description, photo_url, location_lat, location_lng, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [reportId, realPetId, finderName, finderEmail, finderPhone, description, photoUrl, lat, lng]
    );

    // 5. Obtener información del dueño para notificar
    const ownerResult = await db.execute(
      `SELECT u.email as owner_email, u.name as owner_name
       FROM users u
       WHERE u.id = ?`,
      [pet.user_id]
    );

    if (ownerResult.rows.length > 0) {
      const owner = ownerResult.rows[0] as any;

      // 6. Enviar email al dueño
      if (resend && process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "XpiPet <onboarding@resend.dev>",
          to: owner.owner_email,
          subject: `🎉 ¡Alguien encontró a ${pet.name}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">¡Buenas noticias!</h2>
              <p>Hola <strong>${owner.owner_name}</strong>,</p>
              <p>Alguien reportó haber encontrado a <strong>${pet.name}</strong>.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Nombre del encontrador:</strong> ${finderName}</p>
                <p><strong>Email:</strong> ${finderEmail}</p>
                ${finderPhone ? `<p><strong>Teléfono:</strong> ${finderPhone}</p>` : ''}
                <p><strong>Mensaje:</strong> ${description}</p>
              </div>
              ${photoUrl ? `<p><strong>Foto:</strong> <a href="${photoUrl}">Ver foto</a></p>` : ''}
              <p style="color: #6b7280; font-size: 14px;">Inicia sesión en XpiPet para ver más detalles y contactar al encontrador.</p>
            </div>
          `,
        });
        console.log("✅ Email de notificación enviado al dueño:", owner.owner_email);
      } else {
        console.log("⚠️ RESEND_API_KEY no configurada. El reporte se guardó, pero no se envió email.");
      }
    }

    console.log("✅ Reporte guardado exitosamente:", reportId);

    return NextResponse.json(
      { message: "Reporte guardado exitosamente. El dueño será notificado.", reportId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error al guardar reporte:", error);
    return NextResponse.json(
      { message: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}