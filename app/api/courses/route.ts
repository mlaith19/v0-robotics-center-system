import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

function cleanStr(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  })
  return Response.json(courses)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = cleanStr(body.name)
    if (!name) return Response.json({ error: "name is required" }, { status: 400 })

    const course = await prisma.course.create({ data: { name } })
    return Response.json(course, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/courses error:", err)

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return Response.json({ error: "Duplicate unique field" }, { status: 409 })
      }
    }

    return Response.json({ error: "Failed to create course" }, { status: 500 })
  }
}
