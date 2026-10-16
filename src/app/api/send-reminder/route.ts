import { NextResponse } from "next/server";
import { Resend } from "resend";

// Inicializar Resend con la API Key de tu .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, petName, subject, message } = await request.json();

    // Validación básica
    if (!to || !petName || !subject || !message) {
      return NextResponse.json(
        { error: "Faltan datos para enviar el correo" },
        { status: 400 }
      );
    }

    // Enviar el correo usando Resend
    const { data, error } = await resend.emails.send({
      from: "XpiPet Recordatorios <onboarding@resend.dev>",
      to: [to],
      subject: ` Recordatorio para ${petName}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          
          <!-- Encabezado -->
          <div style="background-color: #9333ea; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🐾 XpiPet</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Recordatorio de Salud</p>
          </div>
          
          <!-- Contenido -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">¡Hola!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Este es un recordatorio importante para el cuidado y la salud de <strong style="color: #9333ea;">${petName}</strong>:
            </p>
            
            <!-- Caja de la alerta -->
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #9333ea;">
              <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
                🚨 ${subject}
              </p>
              <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.5;">
                ${message}
              </p>
            </div>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              Por favor, ingresá a tu panel de control en XpiPet para revisar los detalles o actualizar el estado de salud de tu mascota.
            </p>
          </div>

          <!-- Pie de página -->
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0;">Enviado automáticamente por XpiPet 🐶🐱</p>
            <p style="margin: 5px 0 0 0;">Cuidando a tu mascota, un recordatorio a la vez.</p>
          </div>
        </div>
      `,
    });

    // Si Resend devuelve error, lo mostramos
    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error en el endpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}