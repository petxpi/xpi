import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 2. Generar ID único
    const reportId = crypto.randomUUID();

    // 3. Guardar reporte en la base de datos
    await db.execute(
      `INSERT INTO found_reports (id, pet_id, finder_name, finder_email, finder_phone, description, photo_url, location_lat, location_lng, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [reportId, petId, finderName, finderEmail, finderPhone, description, photoUrl, lat, lng]
    );

    // 4. Obtener información del dueño para notificar
    const petResult = await db.execute(
      `SELECT p.id, p.name as pet_name, u.email as owner_email, u.name as owner_name 
       FROM pets p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [petId]
    );

    if (petResult.rows.length > 0) {
      const pet = petResult.rows[0] as any;

      // 5. Enviar email al dueño (si está configurado Resend)
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "XpiPet <onboarding@resend.dev>",
          to: pet.owner_email,
          subject: `🎉 ¡Alguien encontró a ${pet.pet_name}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">¡Buenas noticias! </h2>
              <p>Hola <strong>${pet.owner_name}</strong>,</p>
              <p>Alguien reportó haber encontrado a <strong>${pet.pet_name}</strong>.</p>
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
        console.log("✅ Email de notificación enviado al dueño:", pet.owner_email);
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