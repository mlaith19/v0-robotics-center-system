import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params
  const student = await prisma.student.findUnique({ where: { id } })
  return Response.json(student)
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()

  const student = await prisma.student.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  })

  return Response.json(student)
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const { id } = await params
    await prisma.student.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }
    console.error("DELETE /api/students/[id] failed:", e)
    return Response.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 })
  }
}
