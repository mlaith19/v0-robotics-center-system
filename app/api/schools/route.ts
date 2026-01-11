import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function s(v: any) {
  if (v === undefined || v === null) return null
  const t = String(v).trim()
  return t.length ? t : null
}

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(schools)
  } catch (err: any) {
    console.error("GET /api/schools error:", err)
    return NextResponse.json({ error: "Failed to load schools" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = s(body?.name)
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const created = await prisma.school.create({
      data: {
        name,
        city: s(body?.city),
        contactPerson: s(body?.contactPerson ?? body?.contactName), // ✅ תומך גם אם ה-UI עדיין שולח contactName
        phone: s(body?.phone),
        email: s(body?.email),
        address: s(body?.address),
        notes: s(body?.notes),
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/schools error:", err)
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 })
  }
}
