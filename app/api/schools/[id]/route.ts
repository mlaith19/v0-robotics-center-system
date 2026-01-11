import { prisma } from "@/lib/prisma"

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
  const school = await prisma.school.findUnique({ where: { id } })
  return Response.json(school)
}

export async function PUT(req: Request, ctx: { params: Params | Promise<Params> }) {
  try {
    const { id } = await unwrapParams(ctx.params)
    const body = await req.json()

    const name = cleanStr(body.name)
    if (!name) return Response.json({ error: "name is required" }, { status: 400 })

    const school = await prisma.school.update({
      where: { id },
      data: {
        name,
        city: cleanStr(body.city),
        address: cleanStr(body.address),
        phone: cleanStr(body.phone),
        email: cleanStr(body.email),
        contactName: cleanStr(body.contactName),
        notes: cleanStr(body.notes),
      },
    })

    return Response.json(school)
  } catch (err: any) {
    console.error("PUT /api/schools/[id] error:", err)
    return Response.json({ error: "Failed to update school" }, { status: 500 })
  }
}

export async function DELETE(_: Request, ctx: { params: Params | Promise<Params> }) {
  try {
    const { id } = await unwrapParams(ctx.params)
    await prisma.school.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err: any) {
    console.error("DELETE /api/schools/[id] error:", err)
    return Response.json({ error: "Failed to delete school" }, { status: 500 })
  }
}
