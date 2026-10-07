import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "xpipet/mascotas",
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" }
      ]
    });

    return NextResponse.json(
      { 
        url: result.secure_url,
        public_id: result.public_id
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al subir imagen:", error);
    return NextResponse.json(
      { message: "Error al subir imagen: " + error.message },
      { status: 500 }
    );
  }
}