import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const studentId = searchParams.get("studentId")
    const date = searchParams.get("date")

    let query = `SELECT * FROM "Attendance" WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (courseId) {
      query += ` AND "courseId" = $${paramIndex++}`
      params.push(courseId)
    }
    if (studentId) {
      query += ` AND "studentId" = $${paramIndex++}`
      params.push(studentId)
    }
    if (date) {
      query += ` AND "date" = $${paramIndex++}`
      params.push(date)
    }

    query += ` ORDER BY "date" DESC, "createdAt" DESC`

    const result = await sql(query, params)
    return Response.json(result)
  } catch (err) {
    console.error("GET /api/attendance error:", err)
    return Response.json({ error: "Failed to load attendance" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, courseId, date, status, notes } = body

    if (!studentId || !courseId || !date || !status) {
      return Response.json({ error: "studentId, courseId, date, and status are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    // Upsert - update if exists, insert if not
    const existing = await sql`
      SELECT id FROM "Attendance" 
      WHERE "studentId" = ${studentId} 
        AND "courseId" = ${courseId} 
        AND "date" = ${date}
    `

    if (existing.length > 0) {
      const result = await sql`
        UPDATE "Attendance"
        SET status = ${status}, notes = ${notes || null}
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      return Response.json(result[0])
    }

    const result = await sql`
      INSERT INTO "Attendance" (id, "studentId", "courseId", date, status, notes, "createdAt")
      VALUES (${id}, ${studentId}, ${courseId}, ${date}, ${status}, ${notes || null}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/attendance error:", err)
    return Response.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
