// app/api/courses/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacherLinks: { include: { teacher: true } },
      },
    })

    const shaped = courses.map((c) => ({
      ...c,
      teachers: c.teacherLinks.map((l) => l.teacher),
    }))

    return NextResponse.json(shaped)
  } catch (e) {
    console.error("GET /api/courses error:", e)
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const title = String(body.title ?? body.name ?? "").trim()
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    // ✅ teachers יכול להגיע כ-[id,id] או כ-[{id:...}, ...]
    const rawTeacherIds: string[] = Array.isArray(body.teachers)
      ? body.teachers
          .map((t: any) => (typeof t === "string" ? t : t?.id))
          .filter(Boolean)
          .map((x: any) => String(x))
      : []

    // ✅ מסננים רק IDs שבאמת קיימים בטבלת Teacher
    const existingTeachers = rawTeacherIds.length
      ? await prisma.teacher.findMany({
          where: { id: { in: rawTeacherIds } },
          select: { id: true },
        })
      : []

    const existingSet = new Set(existingTeachers.map((t) => t.id))
    const teacherIds = rawTeacherIds.filter((id) => existingSet.has(id))

    const course = await prisma.course.create({
      data: {
        title,
        description: body.description ?? null,
        price: body.price === "" || body.price == null ? null : Number(body.price),
        isActive: body.isActive ?? true,

        duration: body.duration ?? null,
        level: body.level ?? null,
        status: body.status ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        startTime: body.startTime ?? null,
        endTime: body.endTime ?? null,
        weekdays: Array.isArray(body.weekdays) ? body.weekdays.map((d: any) => String(d)) : [],

        teacherLinks:
          teacherIds.length > 0
            ? {
                create: teacherIds.map((teacherId) => ({
                  teacher: { connect: { id: teacherId } },
                })),
              }
            : undefined,
      },
      include: {
        teacherLinks: { include: { teacher: true } },
      },
    })

    return NextResponse.json({
      ...course,
      teachers: course.teacherLinks.map((l) => l.teacher),
    })
  } catch (e: any) {
    console.error("POST /api/courses error:", e)
    return NextResponse.json({ error: e?.message || "Failed to create course" }, { status: 500 })
  }
}
