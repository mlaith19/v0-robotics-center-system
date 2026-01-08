import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id } })
  return Response.json(student)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const student = await prisma.student.update({
    where: { id: params.id },
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  })
  return Response.json(student)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.student.delete({ where: { id: params.id } })
  return new Response(null, { status: 204 })
}
