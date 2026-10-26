import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, folder } = body;

    if (!image) {
      return NextResponse.json({ message: "No se proporcionó imagen" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: folder || "xpipet/clinics",
      resource_type: "auto",
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json({ message: "Error al subir imagen" }, { status: 500 });
  }
}