import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params

  try {
    const result = await sql`SELECT * FROM "Teacher" WHERE id = ${id}`
    
    if (result.length === 0) {
      return Response.json({ error: "Teacher not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/teachers/[id] error:", err)
    return Response.json({ error: "Failed to load teacher" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()

  try {
    const name = String(body.name ?? "").trim()
    const email = body.email ? String(body.email).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const now = new Date().toISOString()

    const result = await sql`
      UPDATE "Teacher"
      SET name = ${name}, email = ${email}, phone = ${phone}, "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Teacher not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/teachers/[id] error:", err)
    return Response.json({ error: "Failed to update teacher" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    await sql`DELETE FROM "Teacher" WHERE id = ${id}`
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/teachers/[id] error:", err)
    return Response.json({ error: "Failed to delete teacher" }, { status: 500 })
  }
}
