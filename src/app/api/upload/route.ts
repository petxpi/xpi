import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// Aumentar el timeout a 2 minutos
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Verificar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "La imagen es demasiado grande. Máximo 10MB" },
        { status: 400 }
      );
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64String}`;

    // Subir a Cloudinary con timeout extendido
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "xpipet/mascotas",
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" }
      ],
      timeout: 60000 // 60 segundos de timeout para Cloudinary
    });

    return NextResponse.json(
      { 
        url: result.secure_url,
        public_id: result.public_id
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(" Error al subir imagen:", error);
    
    // Mensaje de error más descriptivo
    let errorMessage = "Error desconocido al subir la imagen";
    
    if (error.message?.includes("timeout")) {
      errorMessage = "La subida tardó demasiado. Intenta con una imagen más pequeña o verifica tu conexión a internet.";
    } else if (error.message?.includes("Invalid")) {
      errorMessage = "Credenciales de Cloudinary inválidas. Verifica tu API Key y API Secret en .env.local";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}