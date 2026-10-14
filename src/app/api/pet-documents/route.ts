export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const publicOnly = searchParams.get("public") === "true";

    if (!petId) {
      return NextResponse.json({ message: "Falta petId" }, { status: 400 });
    }

    let query = `
      SELECT pd.* 
      FROM pet_documents pd
      JOIN pets p ON pd.pet_id = p.id
      WHERE (p.id = ? OR p.public_id = ?)
    `;
    let params: any[] = [petId, petId];

    if (publicOnly) {
      query += ` AND pd.public = 1`;
    }

    query += ` ORDER BY pd.created_at DESC`;

    const result = await db.execute(query, params);

    return NextResponse.json({ documents: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener documentos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}