export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT pm.* 
      FROM pet_milestones pm
      JOIN pets p ON pm.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    if (publicOnly) {
      query += ` AND pm.public = 1`;
    }

    query += ` ORDER BY pm.milestone_date DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ milestones: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener hitos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}