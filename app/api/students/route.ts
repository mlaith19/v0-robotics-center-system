import { prisma } from "@/lib/prisma"

export async function GET() {
  const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } })
  return Response.json(students)
}

export async function POST(req: Request) {
  const body = await req.json()

  if (!body?.name) {
    return Response.json({ error: "name is required" }, { status: 400 })
  }

  const student = await prisma.student.create({
    data: {
      name: body.name,
      idNumber: body.idNumber ?? null,
      birthDate: body.birthDate ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      address: body.address ?? null,
      city: body.city ?? null,
      father: body.father ?? null,
      mother: body.mother ?? null,
      additionalPhone: body.additionalPhone ?? null,
      healthFund: body.healthFund ?? null,
      allergies: body.allergies ?? null,
      status: body.status ?? "מתעניין",
      totalSessions: Number.isFinite(body.totalSessions) ? body.totalSessions : 12,
      courseIds: Array.isArray(body.courseIds) ? body.courseIds : [],
      courseSessions: body.courseSessions ?? null,
    },
  })

  return Response.json(student)
}
