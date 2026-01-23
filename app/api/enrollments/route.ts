import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const studentId = searchParams.get("studentId")

    // Use tagged template literal for different query scenarios
    let result
    if (courseId && studentId) {
      result = await sql`
        SELECT e.*, s.name as "studentName", c.name as "courseName"
        FROM "Enrollment" e
        LEFT JOIN "Student" s ON e."studentId" = s.id
        LEFT JOIN "Course" c ON e."courseId" = c.id
        WHERE e."courseId" = ${courseId} AND e."studentId" = ${studentId}
        ORDER BY e."enrollmentDate" DESC
      `
    } else if (courseId) {
      result = await sql`
        SELECT e.*, s.name as "studentName", c.name as "courseName"
        FROM "Enrollment" e
        LEFT JOIN "Student" s ON e."studentId" = s.id
        LEFT JOIN "Course" c ON e."courseId" = c.id
        WHERE e."courseId" = ${courseId}
        ORDER BY e."enrollmentDate" DESC
      `
    } else if (studentId) {
      result = await sql`
        SELECT e.*, s.name as "studentName", c.name as "courseName"
        FROM "Enrollment" e
        LEFT JOIN "Student" s ON e."studentId" = s.id
        LEFT JOIN "Course" c ON e."courseId" = c.id
        WHERE e."studentId" = ${studentId}
        ORDER BY e."enrollmentDate" DESC
      `
    } else {
      result = await sql`
        SELECT e.*, s.name as "studentName", c.name as "courseName"
        FROM "Enrollment" e
        LEFT JOIN "Student" s ON e."studentId" = s.id
        LEFT JOIN "Course" c ON e."courseId" = c.id
        ORDER BY e."enrollmentDate" DESC
      `
    }

    return Response.json(result)
  } catch (err) {
    console.error("GET /api/enrollments error:", err)
    return Response.json({ error: "Failed to load enrollments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, courseId, status, sessionsLeft } = body

    if (!studentId || !courseId) {
      return Response.json({ error: "studentId and courseId are required" }, { status: 400 })
    }

    // Check if enrollment already exists
    const existing = await sql`
      SELECT id FROM "Enrollment" 
      WHERE "studentId" = ${studentId} AND "courseId" = ${courseId}
    `

    if (existing.length > 0) {
      return Response.json({ error: "Enrollment already exists" }, { status: 409 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const enrollmentDate = new Date().toISOString().split('T')[0]
    const sessions = sessionsLeft ?? 12 // Default to 12 if not provided

    const result = await sql`
      INSERT INTO "Enrollment" (id, "studentId", "courseId", "enrollmentDate", status, "sessionsLeft", "createdAt")
      VALUES (${id}, ${studentId}, ${courseId}, ${enrollmentDate}, ${status || 'active'}, ${sessions}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/enrollments error:", err)
    return Response.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const courseId = searchParams.get("courseId")

    if (!studentId || !courseId) {
      return Response.json({ error: "studentId and courseId are required" }, { status: 400 })
    }

    await sql`
      DELETE FROM "Enrollment" 
      WHERE "studentId" = ${studentId} AND "courseId" = ${courseId}
    `

    return Response.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/enrollments error:", err)
    return Response.json({ error: "Failed to delete enrollment" }, { status: 500 })
  }
}
