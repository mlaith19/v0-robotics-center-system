import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const studentId = searchParams.get("studentId")
    const date = searchParams.get("date")

    // Use tagged template literals for different query scenarios
    let result
    if (courseId && studentId && date) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "courseId" = ${courseId} AND "studentId" = ${studentId} AND "date" = ${date}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else if (courseId && studentId) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "courseId" = ${courseId} AND "studentId" = ${studentId}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else if (courseId && date) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "courseId" = ${courseId} AND "date" = ${date}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else if (studentId && date) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "studentId" = ${studentId} AND "date" = ${date}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else if (courseId) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "courseId" = ${courseId}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else if (studentId) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "studentId" = ${studentId}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else if (date) {
      result = await sql`
        SELECT * FROM "Attendance" 
        WHERE "date" = ${date}
        ORDER BY "date" DESC, "createdAt" DESC
      `
    } else {
      result = await sql`
        SELECT * FROM "Attendance"
        ORDER BY "date" DESC, "createdAt" DESC
      `
    }

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

    // Validate that course exists
    const courseExists = await sql`SELECT id FROM "Course" WHERE id = ${courseId}`
    if (courseExists.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }

    // Validate that student exists
    const studentExists = await sql`SELECT id FROM "Student" WHERE id = ${studentId}`
    if (studentExists.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
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
