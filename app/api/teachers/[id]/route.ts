import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/teachers/[id]?include=1
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params

  const url = new URL(req.url)
  const wantInclude = url.searchParams.get("include") === "1"

  // תמיד ננסה קודם "עם relations" (אם ביקשו include)
  if (wantInclude) {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        // ⬇️ אם אין relations בסכמה שלך - Prisma יזרוק ValidationError ואנחנו נעשה fallback
        include: {
          // @ts-ignore - ייתכן ולא קיים עדיין בסכמה
          teacherCourses: { include: { course: true } },
          // @ts-ignore - ייתכן ולא קיים עדיין בסכמה
          payments: { orderBy: { date: "desc" } },
          // @ts-ignore - ייתכן ולא קיים עדיין בסכמה
          attendance: { include: { course: true }, orderBy: { date: "desc" } },
        } as any,
      })

      return Response.json(teacher)
    } catch (err: any) {
      // אם אין relations בסכמה, נחזיר Teacher בסיסי + טבלאות ריקות
      if (err instanceof Prisma.PrismaClientValidationError) {
        const teacher = await prisma.teacher.findUnique({ where: { id } })

        return Response.json({
          ...teacher,
          teacherCourses: [],
          payments: [],
          attendance: [],
        })
      }

      // כל שגיאה אחרת
      console.error("GET /api/teachers/[id] include failed:", err)
      return new Response("Failed to load teacher", { status: 500 })
    }
  }

  // בלי include
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } })
    return Response.json(teacher)
  } catch (err) {
    console.error("GET /api/teachers/[id] failed:", err)
    return new Response("Failed to load teacher", { status: 500 })
  }
}

// PUT /api/teachers/[id]
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()

  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
      },
    })

    return Response.json(teacher)
  } catch (err) {
    console.error("PUT /api/teachers/[id] failed:", err)
    return new Response("Failed to update teacher", { status: 500 })
  }
}

// DELETE /api/teachers/[id]
export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    await prisma.teacher.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/teachers/[id] failed:", err)
    return new Response("Failed to delete teacher", { status: 500 })
  }
}
