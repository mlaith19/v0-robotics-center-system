import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`
      SELECT g.*, s.name as "schoolName"
      FROM "Gafan" g
      LEFT JOIN "School" s ON g."schoolId" = s.id
      WHERE g.id = ${id}
    `
    
    if (result.length === 0) {
      return Response.json({ error: "Gafan program not found" }, { status: 404 })
    }
    
    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/gafan/[id] error:", err)
    return Response.json({ error: "Failed to load gafan program" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, schoolId, startDate, endDate, price, status } = body

    const now = new Date().toISOString()

    const result = await sql`
      UPDATE "Gafan"
      SET name = ${name}, description = ${description || null}, "schoolId" = ${schoolId},
          "startDate" = ${startDate || null}, "endDate" = ${endDate || null},
          price = ${price || 0}, status = ${status || "active"}, "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Gafan program not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/gafan/[id] error:", err)
    return Response.json({ error: "Failed to update gafan program" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await sql`DELETE FROM "Gafan" WHERE id = ${id}`
    return Response.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/gafan/[id] error:", err)
    return Response.json({ error: "Failed to delete gafan program" }, { status: 500 })
  }
}
