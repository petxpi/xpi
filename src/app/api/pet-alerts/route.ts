export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");
    if (!token) return null;
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

// GET: Obtener alertas inteligentes de una mascota
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    // Verificar que la mascota sea del usuario
    const petCheck = await db.execute(
      `SELECT id, name FROM pets WHERE id = ? AND user_id = ?`,
      [petId, userId]
    );

    if (petCheck.rows.length === 0) {
      return NextResponse.json({ message: "Mascota no encontrada" }, { status: 404 });
    }

    const petName = (petCheck.rows[0] as any).name;
    const alerts: any[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

    // 1️⃣ ALERTAS DE VACUNAS
    const vaccinesResult = await db.execute(
      `SELECT * FROM vaccinations WHERE pet_id = ? AND next_due IS NOT NULL`,
      [petId]
    );
    for (const vac of vaccinesResult.rows) {
      const vacAny = vac as any;
      const nextDue = new Date(vacAny.next_due);
      if (nextDue < today) {
        const daysOverdue = Math.floor((today.getTime() - nextDue.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `vac-${vacAny.id}`,
          type: "vaccine",
          severity: "critical",
          icon: "💉",
          title: `Vacuna vencida: ${vacAny.vaccine_name}`,
          message: `Venció hace ${daysOverdue} día(s) (${vacAny.next_due})`,
          action: "Programar aplicación",
          petId,
        });
      } else if (nextDue <= thirtyDaysFromNow) {
        const daysLeft = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `vac-${vacAny.id}`,
          type: "vaccine",
          severity: "warning",
          icon: "💉",
          title: `Vacuna próxima: ${vacAny.vaccine_name}`,
          message: `Vence en ${daysLeft} día(s) (${vacAny.next_due})`,
          action: "Agendar cita",
          petId,
        });
      }
    }

    // 2️ ALERTAS DE DESPARASITACIONES
    const dewormingResult = await db.execute(
      `SELECT * FROM pet_deworming WHERE pet_id = ? AND next_date IS NOT NULL`,
      [petId]
    );
    for (const dew of dewormingResult.rows) {
      const dewAny = dew as any;
      const nextDate = new Date(dewAny.next_date);
      if (nextDate < today) {
        const daysOverdue = Math.floor((today.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `dew-${dewAny.id}`,
          type: "deworming",
          severity: "critical",
          icon: "🦠",
          title: `Desparasitación vencida: ${dewAny.product_name}`,
          message: `Venció hace ${daysOverdue} día(s) (${dewAny.next_date})`,
          action: "Aplicar desparasitante",
          petId,
        });
      } else if (nextDate <= thirtyDaysFromNow) {
        const daysLeft = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `dew-${dewAny.id}`,
          type: "deworming",
          severity: "warning",
          icon: "🦠",
          title: `Desparasitación próxima: ${dewAny.product_name}`,
          message: `Vence en ${daysLeft} día(s) (${dewAny.next_date})`,
          action: "Programar aplicación",
          petId,
        });
      }
    }

    // 3️⃣ ALERTAS DE MEDICAMENTOS POR TERMINAR
    const medsResult = await db.execute(
      `SELECT * FROM pet_medications WHERE pet_id = ? AND end_date IS NOT NULL`,
      [petId]
    );
    for (const med of medsResult.rows) {
      const medAny = med as any;
      const endDate = new Date(medAny.end_date);
      if (endDate < today) {
        alerts.push({
          id: `med-${medAny.id}`,
          type: "medication",
          severity: "critical",
          icon: "💊",
          title: `Medicamento vencido: ${medAny.medication_name}`,
          message: `Venció el ${medAny.end_date}. Consultar con el veterinario.`,
          action: "Revisar tratamiento",
          petId,
        });
      } else if (endDate <= thirtyDaysFromNow) {
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `med-${medAny.id}`,
          type: "medication",
          severity: "warning",
          icon: "💊",
          title: `Medicamento por terminar: ${medAny.medication_name}`,
          message: `Termina en ${daysLeft} día(s) (${medAny.end_date})`,
          action: "Consultar renovación",
          petId,
        });
      }
    }

    // 4️ ALERTAS DE CAMBIOS BRUSCOS DE PESO
    const weightsResult = await db.execute(
      `SELECT * FROM pet_weights WHERE pet_id = ? ORDER BY date DESC LIMIT 2`,
      [petId]
    );
    if (weightsResult.rows.length >= 2) {
      const last = weightsResult.rows[0] as any;
      const prev = weightsResult.rows[1] as any;
      const lastWeight = parseFloat(last.weight);
      const prevWeight = parseFloat(prev.weight);
      const change = Math.abs(lastWeight - prevWeight);
      const changePercent = (change / prevWeight) * 100;
      
      if (changePercent >= 10) {
        const direction = lastWeight > prevWeight ? "aumento" : "descenso";
        alerts.push({
          id: `weight-${last.id}`,
          type: "weight",
          severity: "warning",
          icon: "️",
          title: `Cambio brusco de peso detectado`,
          message: `${petName} tuvo un ${direction} del ${changePercent.toFixed(1)}% (${prevWeight}kg → ${lastWeight}kg)`,
          action: "Consultar veterinario",
          petId,
        });
      }
    }

    // 5️⃣ ALERTAS DE EVENTOS MÉDICOS EN TRATAMIENTO
    const historyResult = await db.execute(
      `SELECT * FROM pet_medical_history WHERE pet_id = ? AND recovered = 0`,
      [petId]
    );
    for (const event of historyResult.rows) {
      const eventAny = event as any;
      alerts.push({
        id: `hist-${eventAny.id}`,
        type: "medical",
        severity: "info",
        icon: "🏥",
        title: `Tratamiento en curso: ${eventAny.condition}`,
        message: `${eventAny.condition} - En tratamiento desde ${eventAny.date}`,
        action: "Ver detalles",
        petId,
      });
    }

    // Ordenar por severidad: critical > warning > info
    const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({ 
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === "critical").length,
        warning: alerts.filter(a => a.severity === "warning").length,
        info: alerts.filter(a => a.severity === "info").length,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error al generar alertas:", error);
    return NextResponse.json({ message: "Error interno: " + error.message }, { status: 500 });
  }
}4