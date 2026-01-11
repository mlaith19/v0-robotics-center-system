import { prisma } from "@/lib/prisma"

export async function GET() {
  const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: "desc" } })
  return Response.json(teachers)
}

export async function POST(req: Request) {
  const body = await req.json()

  const teacher = await prisma.teacher.create({
    data: {
      name: String(body.name ?? "").trim(),
      email: body.email ? String(body.email).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
    },
  })

  return Response.json(teacher, { status: 201 })
}
