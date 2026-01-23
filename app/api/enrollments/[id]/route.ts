import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await sql`
      SELECT e.*, s.name as "studentName", c.name as "courseName"
      FROM "Enrollment" e
      LEFT JOIN "Student" s ON e."studentId" = s.id
      LEFT JOIN "Course" c ON e."courseId" = c.id
      WHERE e.id = ${id}
    `
    if (result.length === 0) {
      return Response.json({ error: "Enrollment not found" }, { status: 404 })
    }
    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/enrollments/[id] error:", err)
    return Response.json({ error: "Failed to load enrollment" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { sessionsLeft, status } = body

    const updates: string[] = []
    const values: any[] = []
    
    if (sessionsLeft !== undefined) {
      const result = await sql`
        UPDATE "Enrollment" 
        SET "sessionsLeft" = ${sessionsLeft}
        WHERE id = ${id}
        RETURNING *
      `
      return Response.json(result[0])
    }
    
    if (status !== undefined) {
      const result = await sql`
        UPDATE "Enrollment" 
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `
      return Response.json(result[0])
    }

    return Response.json({ error: "No valid fields to update" }, { status: 400 })
  } catch (err) {
    console.error("PUT /api/enrollments/[id] error:", err)
    return Response.json({ error: "Failed to update enrollment" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM "Enrollment" WHERE id = ${id}`
    return Response.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/enrollments/[id] error:", err)
    return Response.json({ error: "Failed to delete enrollment" }, { status: 500 })
  }
}
