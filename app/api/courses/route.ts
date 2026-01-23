import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get courses with enrollment count and payment stats
    const courses = await sql`
      SELECT 
        c.*,
        COALESCE(enrollment_stats."enrollmentCount", 0) as "enrollmentCount",
        COALESCE(payment_stats."totalPaid", 0) as "totalPaid",
        COALESCE(payment_stats."paidCount", 0) as "paidCount"
      FROM "Course" c
      LEFT JOIN (
        SELECT "courseId", COUNT(*) as "enrollmentCount"
        FROM "Enrollment"
        GROUP BY "courseId"
      ) enrollment_stats ON c.id = enrollment_stats."courseId"
      LEFT JOIN (
        SELECT 
          e."courseId",
          COALESCE(SUM(p.amount), 0) as "totalPaid",
          COUNT(DISTINCT p."studentId") as "paidCount"
        FROM "Enrollment" e
        LEFT JOIN "Payment" p ON e."studentId" = p."studentId"
        GROUP BY e."courseId"
      ) payment_stats ON c.id = payment_stats."courseId"
      ORDER BY c."createdAt" DESC
    `
    return Response.json(courses)
  } catch (err) {
    console.error("GET /api/courses error:", err)
    return Response.json({ error: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = body.name ? String(body.name).trim() : null

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const description = body.description ? String(body.description).trim() : null
    const level = body.level ? String(body.level).trim() : "beginner"
    const duration = body.duration ? Number(body.duration) : null
    const price = body.price ? Number(body.price) : null
    const status = body.status ? String(body.status).trim() : "active"
    
    // New fields
    const courseNumber = body.courseNumber ? String(body.courseNumber).trim() : null
    const category = body.category ? String(body.category).trim() : null
    const courseType = body.courseType ? String(body.courseType).trim() : "regular"
    const location = body.location ? String(body.location).trim() : "center"
    const startDate = body.startDate || null
    const endDate = body.endDate || null
    const startTime = body.startTime || null
    const endTime = body.endTime || null
    const daysOfWeek = Array.isArray(body.daysOfWeek) ? body.daysOfWeek : []
    const teacherIds = Array.isArray(body.teacherIds) ? body.teacherIds : []

    const result = await sql`
      INSERT INTO "Course" (
        id, name, description, level, duration, price, status, 
        "courseNumber", category, "courseType", location,
        "startDate", "endDate", "startTime", "endTime",
        "daysOfWeek", "teacherIds",
        "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${name}, ${description}, ${level}, ${duration}, ${price}, ${status},
        ${courseNumber}, ${category}, ${courseType}, ${location},
        ${startDate}, ${endDate}, ${startTime}, ${endTime},
        ${daysOfWeek}, ${teacherIds},
        ${now}, ${now}
      )
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err: any) {
    console.error("POST /api/courses error:", err)
    
    if (err.code === "23505") {
      return Response.json({ error: "Duplicate unique field" }, { status: 409 })
    }

    return Response.json({ error: "Failed to create course" }, { status: 500 })
  }
}
