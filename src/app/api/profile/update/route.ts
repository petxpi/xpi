import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, whatsapp, currentPassword, newPassword } = body;

    // Obtener el ID del usuario de la cookie (simplificado)
    const authResponse = await fetch("http://localhost:3000/api/auth/me", {
      headers: request.headers,
    });
    
    if (!authResponse.ok) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const authData = await authResponse.json();
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    // Si quiere cambiar contraseña, verificar la actual
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Debes ingresar tu contraseña actual" }, { status: 400 });
      }

      const userResult: any = await query(
        "SELECT password FROM users WHERE id = ?",
        [userId]
      );

      if (!userResult.rows || userResult.rows.length === 0) {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
      if (!isValid) {
        return NextResponse.json({ message: "Contraseña actual incorrecta" }, { status: 400 });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId]
      );
    }

    // Actualizar datos básicos
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }

    if (whatsapp !== undefined) {
      updateFields.push("whatsapp = ?");
      updateValues.push(whatsapp);
    }

    if (updateFields.length > 0) {
      updateValues.push(userId);
      await query(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );
    }

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
    });

  } catch (error: any) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}