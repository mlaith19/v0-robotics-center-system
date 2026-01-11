import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type Params = { id: string }
async function unwrapParams(params: any): Promise<Params> {
  return await Promise.resolve(params)
}

function cleanStr(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

export async function GET(_: Request, ctx: { params: Params | Promise<Params> }) {
  const { id } = await unwrapParams(ctx.params)
  const course = await prisma.course.findUnique({ where: { id } })
  return Response.json(course)
}

export async function PUT(req: Request, ctx: { params: Params | Promise<Params> }) {
  try {
    const { id } = await unwrapParams(ctx.params)
    const body = await req.json()
    const name = cleanStr(body.name)
    if (!name) return Response.json({ error: "name is required" }, { status: 400 })

    const course = await prisma.course.update({
      where: { id },
      data: { name },
    })
    return Response.json(course)
  } catch (err: any) {
    console.error("PUT /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(_: Request, ctx: { params: Params | Promise<Params> }) {
  try {
    const { id } = await unwrapParams(ctx.params)
    await prisma.course.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err: any) {
    console.error("DELETE /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
