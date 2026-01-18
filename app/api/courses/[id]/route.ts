// app/api/courses/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Ctx = { params: { id: string } }

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacherLinks: { include: { teacher: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...course,
      teachers: course.teacherLinks.map((l) => l.teacher),
    })
  } catch (e) {
    console.error("GET /api/courses/[id] error:", e)
    return NextResponse.json({ error: "Failed to load course" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const id = params.id
    const body = await req.json()

    const title = String(body.title ?? body.name ?? "").trim()

    // חשוב: teachers יכול להגיע כ-[{id:...}] או כ-[id,id]
    const teacherIds: string[] = Array.isArray(body.teachers)
      ? body.teachers
          .map((t: any) => (typeof t === "string" ? t : t?.id))
          .filter(Boolean)
          .map((x: any) => String(x))
      : []

    // ✅ מוודאים שקיימים באמת מורים כאלה ב-DB (כדי לא לקבל שגיאת connect)
    const existingTeachers = teacherIds.length
      ? await prisma.teacher.findMany({
          where: { id: { in: teacherIds } },
          select: { id: true },
        })
      : []

    const existingTeacherIds = new Set(existingTeachers.map((t) => t.id))
    const validTeacherIds = teacherIds.filter((tid) => existingTeacherIds.has(tid))

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        description: body.description ?? undefined,
        price: body.price === "" || body.price == null ? null : Number(body.price),
        isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,

        duration: body.duration ?? undefined,
        level: body.level ?? undefined,
        status: body.status ?? undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        startTime: body.startTime ?? undefined,
        endTime: body.endTime ?? undefined,
        weekdays: Array.isArray(body.weekdays) ? body.weekdays.map((d: any) => String(d)) : undefined,

        // ✅ Reset links ואז create מחדש (הכי יציב)
        teacherLinks: {
          deleteMany: {}, // מוחק את כל הקישורים של הקורס
          create: validTeacherIds.map((teacherId) => ({
            teacher: { connect: { id: teacherId } },
          })),
        },
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
    console.error("PATCH /api/courses/[id] error:", e)
    return NextResponse.json({ error: e?.message || "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const id = params.id

    // קודם מוחקים קישורים כדי להיות נקי
    await prisma.courseTeacher.deleteMany({ where: { courseId: id } })
    await prisma.enrollment.deleteMany({ where: { courseId: id } })

    await prisma.course.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("DELETE /api/courses/[id] error:", e)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
