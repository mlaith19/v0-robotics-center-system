import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

type Ctx = { params: Promise<{ id: string }> }

function cleanStr(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params
  
  try {
    const result = await sql`SELECT * FROM "Course" WHERE id = ${id}`
    
    if (result.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to load course" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()
  const name = cleanStr(body.name)
  
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 })
  }

  try {
    const now = new Date().toISOString()
    const result = await sql`
      UPDATE "Course"
      SET name = ${name}, "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    await sql`DELETE FROM "Course" WHERE id = ${id}`
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
