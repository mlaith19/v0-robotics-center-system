import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const studentId = searchParams.get("studentId")
    const date = searchParams.get("date")

    // Use tagged template literals for different query scenarios
    // JOIN with Course to get course name and duration
    let result
    if (courseId && studentId && date) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."courseId" = ${courseId} AND a."studentId" = ${studentId} AND a."date" = ${date}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else if (courseId && studentId) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."courseId" = ${courseId} AND a."studentId" = ${studentId}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else if (courseId && date) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."courseId" = ${courseId} AND a."date" = ${date}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else if (studentId && date) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."studentId" = ${studentId} AND a."date" = ${date}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else if (courseId) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."courseId" = ${courseId}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else if (studentId) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."studentId" = ${studentId}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else if (date) {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        WHERE a."date" = ${date}
        ORDER BY a."date" DESC, a."createdAt" DESC
      `
    } else {
      result = await sql`
        SELECT a.*, c.name as "courseName", c.duration as "courseDuration"
        FROM "Attendance" a
        LEFT JOIN "Course" c ON a."courseId" = c.id
        ORDER BY a."date" DESC, a."createdAt" DESC
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
    const { studentId, teacherId, courseId, date, status, notes } = body

    // Either studentId or teacherId is required (not both)
    if ((!studentId && !teacherId) || !courseId || !date || !status) {
      return Response.json({ error: "studentId or teacherId, courseId, date, and status are required" }, { status: 400 })
    }

    // Validate that course exists
    const courseExists = await sql`SELECT id FROM "Course" WHERE id = ${courseId}`
    if (courseExists.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }

    // Validate that student or teacher exists
    if (studentId) {
      const studentExists = await sql`SELECT id FROM "Student" WHERE id = ${studentId}`
      if (studentExists.length === 0) {
        return Response.json({ error: "Student not found" }, { status: 404 })
      }
    }
    
    if (teacherId) {
      const teacherExists = await sql`SELECT id FROM "Teacher" WHERE id = ${teacherId}`
      if (teacherExists.length === 0) {
        return Response.json({ error: "Teacher not found" }, { status: 404 })
      }
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    // Upsert - update if exists, insert if not
    // Check based on whether it's student or teacher attendance
    let existing
    if (studentId) {
      existing = await sql`
        SELECT id FROM "Attendance" 
        WHERE "studentId" = ${studentId} 
          AND "courseId" = ${courseId} 
          AND "date" = ${date}
      `
    } else {
      existing = await sql`
        SELECT id FROM "Attendance" 
        WHERE "teacherId" = ${teacherId} 
          AND "courseId" = ${courseId} 
          AND "date" = ${date}
      `
    }

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
      INSERT INTO "Attendance" (id, "studentId", "teacherId", "courseId", date, status, notes, "createdAt")
      VALUES (${id}, ${studentId || null}, ${teacherId || null}, ${courseId}, ${date}, ${status}, ${notes || null}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/attendance error:", err)
    return Response.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const studentId = searchParams.get("studentId")
    const teacherId = searchParams.get("teacherId")
    const courseId = searchParams.get("courseId")
    const date = searchParams.get("date")

    // Delete by ID if provided
    if (id) {
      await sql`DELETE FROM "Attendance" WHERE id = ${id}`
      return Response.json({ success: true })
    }

    // Delete by studentId, courseId, and date
    if (studentId && courseId && date) {
      await sql`
        DELETE FROM "Attendance" 
        WHERE "studentId" = ${studentId} 
          AND "courseId" = ${courseId} 
          AND "date" = ${date}
      `
      return Response.json({ success: true })
    }

    // Delete by teacherId, courseId, and date
    if (teacherId && courseId && date) {
      await sql`
        DELETE FROM "Attendance" 
        WHERE "teacherId" = ${teacherId} 
          AND "courseId" = ${courseId} 
          AND "date" = ${date}
      `
      return Response.json({ success: true })
    }

    return Response.json({ error: "id or (studentId/teacherId + courseId + date) required" }, { status: 400 })
  } catch (err) {
    console.error("DELETE /api/attendance error:", err)
    return Response.json({ error: "Failed to delete attendance" }, { status: 500 })
  }
}
