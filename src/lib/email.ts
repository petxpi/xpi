import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

interface EmailData {
  to: string;
  clinicName: string;
  clientName: string;
  petName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export async function sendAppointmentEmail(data: EmailData, type: "created" | "updated" | "cancelled") {
  try {
    let subject = "";
    let htmlContent = "";

    if (type === "created") {
      subject = `🐾 Cita agendada en ${data.clinicName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <div style="background: #7c3aed; padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🐾</div>
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Cita Agendada!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${data.clinicName}</p>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">Hola <strong>${data.clientName}</strong>,</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Tu cita ha sido registrada exitosamente:</p>
              <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">🐾 Mascota</div>
                  <div style="font-size: 18px; color: #1f2937; font-weight: 700;">${data.petName}</div>
                </div>
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">🩺 Servicio</div>
                  <div style="font-size: 18px; color: #1f2937; font-weight: 700;">${data.serviceName}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📅 Fecha</div>
                    <div style="font-size: 16px; color: #1f2937; font-weight: 600;">${formatDate(data.appointmentDate)}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">⏰ Hora</div>
                    <div style="font-size: 24px; color: #10b981; font-weight: 700;">${data.appointmentTime}</div>
                  </div>
                </div>
                ${data.notes ? `<div style="margin-top: 16px;"><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📝 Notas</div><div style="font-size: 14px; color: #374151; font-style: italic;">${data.notes}</div></div>` : ''}
              </div>
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; color: #92400e; margin-bottom: 4px;">Estado actual</div>
                <div style="font-size: 18px; color: #f59e0b; font-weight: 700;">⏳ Pendiente de confirmación</div>
              </div>
            </div>
            <div style="background: #10b981; padding: 24px; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Powered by XpiPet 🐶</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "updated") {
      subject = `✅ Tu cita en ${data.clinicName} ha sido confirmada`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <div style="background: #7c3aed; padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Cita Confirmada!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${data.clinicName}</p>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">Hola <strong>${data.clientName}</strong>,</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">¡Buenas noticias! Tu cita ha sido <strong style="color: #7c3aed;">confirmada</strong>.</p>
              <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">🐾 Mascota</div><div style="font-size: 18px; color: #1f2937; font-weight: 700;">${data.petName}</div></div>
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">🩺 Servicio</div><div style="font-size: 18px; color: #1f2937; font-weight: 700;">${data.serviceName}</div></div>
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📅 Fecha</div><div style="font-size: 16px; color: #1f2937; font-weight: 600;">${formatDate(data.appointmentDate)}</div></div>
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">⏰ Hora</div><div style="font-size: 24px; color: #10b981; font-weight: 700;">${data.appointmentTime}</div></div>
                </div>
              </div>
              <div style="background: #d1fae5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; color: #065f46; margin-bottom: 4px;">Estado</div>
                <div style="font-size: 20px; color: #10b981; font-weight: 700;">✓ Confirmada</div>
              </div>
            </div>
            <div style="background: #10b981; padding: 24px; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Powered by XpiPet</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "cancelled") {
      subject = `❌ Tu cita en ${data.clinicName} ha sido cancelada`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <div style="background: #ef4444; padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
              <h1 style="color: white; margin: 0; font-size: 28px;">Cita Cancelada</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${data.clinicName}</p>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">Hola <strong>${data.clientName}</strong>,</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Te informamos que tu cita ha sido <strong style="color: #ef4444;">cancelada</strong>.</p>
              <div style="background: #fee2e2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">🐾 Mascota</div><div style="font-size: 18px; color: #1f2937; font-weight: 700;">${data.petName}</div></div>
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">🩺 Servicio</div><div style="font-size: 18px; color: #1f2937; font-weight: 700;">${data.serviceName}</div></div>
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">📅 Fecha</div><div style="font-size: 16px; color: #1f2937; font-weight: 600;">${formatDate(data.appointmentDate)}</div></div>
                  <div><div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">⏰ Hora</div><div style="font-size: 24px; color: #ef4444; font-weight: 700;">${data.appointmentTime}</div></div>
                </div>
              </div>
            </div>
            <div style="background: #10b981; padding: 24px; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Powered by XpiPet</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Email enviado:", result);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error enviando email:", error);
    return { success: false, error: error.message };
  }
}