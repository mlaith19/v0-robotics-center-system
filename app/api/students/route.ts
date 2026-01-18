import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function buildName(body: any) {
  const name = String(body?.name ?? "").trim();
  const firstName = String(body?.firstName ?? "").trim();
  const lastName = String(body?.lastName ?? "").trim();

  if (name) return name;
  const combined = `${firstName} ${lastName}`.trim();
  return combined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = buildName(body);
    const email = body?.email ? String(body.email).trim() : null;
    const phone = body?.phone ? String(body.phone).trim() : null;
    const status = body?.status ? String(body.status).trim() : "מתעניין";

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: { name, email, phone, status },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/students error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (err: any) {
    console.error("GET /api/students error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
