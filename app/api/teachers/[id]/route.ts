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

    // Get courses where this teacher is assigned (teacherIds contains this teacher's id)
    // Include enrollment count for each course
    const courses = await sql`
      SELECT 
        c.id, 
        c.name, 
        c."daysOfWeek",
        c."startTime",
        c."endTime",
        c."startDate",
        c."endDate",
        c.price,
        c.status,
        c.location,
        COALESCE(enrollment_stats."enrollmentCount", 0) as "enrollmentCount"
      FROM "Course" c
      LEFT JOIN (
        SELECT "courseId", COUNT(*) as "enrollmentCount"
        FROM "Enrollment"
        GROUP BY "courseId"
      ) enrollment_stats ON c.id = enrollment_stats."courseId"
      WHERE ${id} = ANY(c."teacherIds")
      ORDER BY c.name
    `

    const teacher = {
      ...result[0],
      teacherCourses: courses.map((c: any) => ({ 
        course: { 
          id: c.id, 
          name: c.name,
          daysOfWeek: c.daysOfWeek,
          startTime: c.startTime,
          endTime: c.endTime,
          startDate: c.startDate,
          endDate: c.endDate,
          price: c.price,
          status: c.status,
          location: c.location,
          enrollmentCount: c.enrollmentCount
        } 
      }))
    }

    return Response.json(teacher)
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
    const idNumber = body.idNumber ? String(body.idNumber).trim() : null
    const birthDate = body.birthDate || null
    const city = body.city ? String(body.city).trim() : null
    const specialty = body.specialization ? String(body.specialization).trim() : null
    const status = body.status ? String(body.status).trim() : null
    const bio = body.bio ? String(body.bio).trim() : null
    const centerHourlyRate = body.centerHourlyRate ?? null
    const travelRate = body.travelRate ?? null
    const externalCourseRate = body.externalCourseRate ?? null
    const now = new Date().toISOString()

    const result = await sql`
      UPDATE "Teacher"
      SET 
        name = ${name}, 
        email = ${email}, 
        phone = ${phone}, 
        "idNumber" = ${idNumber},
        "birthDate" = ${birthDate},
        city = ${city},
        specialty = ${specialty},
        status = ${status},
        bio = ${bio},
        "centerHourlyRate" = ${centerHourlyRate},
        "travelRate" = ${travelRate},
        "externalCourseRate" = ${externalCourseRate},
        "updatedAt" = ${now}
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
