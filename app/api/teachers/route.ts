import { prisma } from "@/lib/prisma"

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
  })
  return Response.json(teachers)
}

export async function POST(req: Request) {
  const body = await req.json()

  const teacher = await prisma.teacher.create({
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  })

  return Response.json(teacher, { status: 201 })
}
