import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    const result = await sql`SELECT * FROM "Student" WHERE id = ${id}`

    if (result.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/students/[id] error:", err)
    return Response.json({ error: "Failed to load student" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()

  try {
    const now = new Date().toISOString()
    const name = body.name ? String(body.name).trim() : null
    const email = body.email ? String(body.email).trim().toLowerCase() : null
    const phone = body.phone ? String(body.phone).trim() : null

    const result = await sql`
      UPDATE "Student"
      SET name = ${name}, email = ${email}, phone = ${phone}, "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/students/[id] error:", err)
    return Response.json({ error: "Failed to update student" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    const result = await sql`DELETE FROM "Student" WHERE id = ${id} RETURNING id`
    
    if (result.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/students/[id] error:", err)
    return Response.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
