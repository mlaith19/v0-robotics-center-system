import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function toNumberOrNull(v: any) {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        courseLinks: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
    })

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })

    const { courseLinks, ...rest } = teacher as any
    return NextResponse.json({
      ...rest,
      courses: (courseLinks || []).map((l: any) => l.course).filter(Boolean),
    })
  } catch (e) {
    console.error("GET /api/teachers/[id] error:", e)
    return NextResponse.json({ error: "Failed to load teacher" }, { status: 500 })
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json().catch(() => ({}))

    // עדכון שדות בלבד (בלי לגעת בקישורי קורסים כרגע כדי לא להכניס תקלות)
    const data: any = {}

    if (body.name !== undefined) data.name = String(body.name).trim()
    if (body.email !== undefined) data.email = body.email ? String(body.email).trim() : null
    if (body.phone !== undefined) data.phone = body.phone ? String(body.phone).trim() : null

    if (body.status !== undefined) data.status = body.status ? String(body.status) : null
    if (body.idNumber !== undefined) data.idNumber = body.idNumber ? String(body.idNumber) : null
    if (body.birthDate !== undefined) data.birthDate = body.birthDate ? new Date(body.birthDate) : null
    if (body.city !== undefined) data.city = body.city ? String(body.city) : null
    if (body.specialties !== undefined) data.specialties = body.specialties ? String(body.specialties) : null
    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null

    if (body.rateCenter !== undefined) data.rateCenter = toNumberOrNull(body.rateCenter)
    if (body.rateTravel !== undefined) data.rateTravel = toNumberOrNull(body.rateTravel)
    if (body.rateExternal !== undefined) data.rateExternal = toNumberOrNull(body.rateExternal)

    const updated = await prisma.teacher.update({
      where: { id },
      data,
      include: {
        courseLinks: { include: { course: { select: { id: true, title: true } } } },
      },
    })

    const { courseLinks, ...rest } = updated as any
    return NextResponse.json({
      ...rest,
      courses: (courseLinks || []).map((l: any) => l.course).filter(Boolean),
    })
  } catch (e: any) {
    console.error("PUT /api/teachers/[id] error:", e)
    return NextResponse.json({ error: e?.message || "Failed to update teacher" }, { status: 500 })
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.teacher.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("DELETE /api/teachers/[id] error:", e)
    return NextResponse.json({ error: e?.message || "Failed to delete teacher" }, { status: 500 })
  }
}
