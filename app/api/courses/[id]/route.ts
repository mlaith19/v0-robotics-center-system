import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

type Ctx = { params: Promise<{ id: string }> }

function cleanStr(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params
  
  try {
    const result = await sql`SELECT * FROM "Course" WHERE id = ${id}`
    
    if (result.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to load course" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()
  const name = cleanStr(body.name)
  
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 })
  }

  const description = cleanStr(body.description)
  const level = cleanStr(body.level) || "beginner"
  const duration = body.duration ? Number(body.duration) : null
  const price = body.price ? Number(body.price) : null
  const status = cleanStr(body.status) || "active"
  
  // New fields
  const courseNumber = cleanStr(body.courseNumber)
  const category = cleanStr(body.category)
  const courseType = cleanStr(body.courseType) || "regular"
  const location = cleanStr(body.location) || "center"
  const startDate = body.startDate || null
  const endDate = body.endDate || null
  const startTime = body.startTime || null
  const endTime = body.endTime || null
  const daysOfWeek = Array.isArray(body.daysOfWeek) ? body.daysOfWeek : []
  const teacherIds = Array.isArray(body.teacherIds) ? body.teacherIds : []
  
  // GAFAN fields
  const schoolId = cleanStr(body.schoolId)
  const gafanProgramId = cleanStr(body.gafanProgramId)

  try {
    const now = new Date().toISOString()
    const result = await sql`
      UPDATE "Course"
      SET name = ${name}, 
          description = ${description},
          level = ${level},
          duration = ${duration},
          price = ${price},
          status = ${status},
          "courseNumber" = ${courseNumber},
          category = ${category},
          "courseType" = ${courseType},
          location = ${location},
          "startDate" = ${startDate},
          "endDate" = ${endDate},
          "startTime" = ${startTime},
          "endTime" = ${endTime},
          "daysOfWeek" = ${daysOfWeek},
          "teacherIds" = ${teacherIds},
          "schoolId" = ${schoolId},
          "gafanProgramId" = ${gafanProgramId},
          "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    await sql`DELETE FROM "Course" WHERE id = ${id}`
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/courses/[id] error:", err)
    return Response.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
