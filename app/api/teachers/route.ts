import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function toNumberOrNull(v: any) {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        courseLinks: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
      },
    })

    const shaped = teachers.map((t) => {
      const { courseLinks, ...rest } = t as any
      return {
        ...rest,
        courses: (courseLinks || []).map((l: any) => l.course).filter(Boolean),
      }
    })

    return NextResponse.json(shaped)
  } catch (e) {
    console.error("GET /api/teachers error:", e)
    return NextResponse.json({ error: "Failed to load teachers" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const name = String(body.name ?? "").trim()
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email: body.email ? String(body.email).trim() : null,
        phone: body.phone ? String(body.phone).trim() : null,

        // שדות VO
        status: body.status ? String(body.status) : null,
        idNumber: body.idNumber ? String(body.idNumber) : null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        city: body.city ? String(body.city) : null,
        specialties: body.specialties ? String(body.specialties) : null,
        notes: body.notes ? String(body.notes) : null,
        rateCenter: toNumberOrNull(body.rateCenter),
        rateTravel: toNumberOrNull(body.rateTravel),
        rateExternal: toNumberOrNull(body.rateExternal),
      },
      include: {
        courseLinks: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
    })

    const { courseLinks, ...rest } = teacher as any
    return NextResponse.json({
      ...rest,
      courses: (courseLinks || []).map((l: any) => l.course).filter(Boolean),
    })
  } catch (e: any) {
    console.error("POST /api/teachers error:", e)
    return NextResponse.json({ error: e?.message || "Failed to create teacher" }, { status: 500 })
  }
}
