import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

function cleanStr(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

export async function GET() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
  })
  return Response.json(students)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = cleanStr(body.name)
    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 })
    }

    const emailRaw = cleanStr(body.email)
    const email = emailRaw ? emailRaw.toLowerCase() : null

    const data: any = {
      name,
      status: cleanStr(body.status) ?? "מתעניין",
      totalSessions: Number.isFinite(Number(body.totalSessions)) ? Number(body.totalSessions) : 12,

      idNumber: cleanStr(body.idNumber),
      birthDate: cleanStr(body.birthDate),
      phone: cleanStr(body.phone),
      address: cleanStr(body.address),
      city: cleanStr(body.city),
      father: cleanStr(body.father),
      mother: cleanStr(body.mother),
      additionalPhone: cleanStr(body.additionalPhone),
      healthFund: cleanStr(body.healthFund),
      allergies: cleanStr(body.allergies),

      // חשוב: תמיד מערך / JSON תקין כדי ש-Prisma לא יקרוס
      courseIds: Array.isArray(body.courseIds) ? body.courseIds.map((x: any) => String(x)) : [],
      courseSessions: body.courseSessions && typeof body.courseSessions === "object" ? body.courseSessions : {},
    }

    // email הוא unique אצלך, אז נשים אותו רק אם באמת קיים
    if (email) data.email = email
    else data.email = null

    const student = await prisma.student.create({ data })
    return Response.json(student, { status: 201 })
  } catch (err: any) {
    // תראה את השגיאה המדויקת בטרמינל
    console.error("POST /api/students error:", err)

    // טיפול בשגיאות Prisma נפוצות
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // unique constraint
      if (err.code === "P2002") {
        return Response.json(
          { error: "Duplicate unique field (probably email). Try another email." },
          { status: 409 },
        )
      }
    }

    return Response.json({ error: "Failed to create student" }, { status: 500 })
  }
}
