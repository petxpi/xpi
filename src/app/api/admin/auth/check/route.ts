import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "secret"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ admin: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.type !== "admin") {
      return NextResponse.json({ admin: null }, { status: 401 });
    }

    return NextResponse.json({
      admin: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }
}