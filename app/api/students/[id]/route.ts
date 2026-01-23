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

    const result = await sql`
      UPDATE "Student"
      SET 
        name = ${body.name || null}, 
        email = ${body.email || null}, 
        phone = ${body.phone || null},
        address = ${body.address || null},
        city = ${body.city || null},
        status = ${body.status || 'פעיל'},
        "birthDate" = ${body.birthDate || null},
        "idNumber" = ${body.idNumber || null},
        father = ${body.father || null},
        mother = ${body.mother || null},
        "additionalPhone" = ${body.additionalPhone || null},
        "healthFund" = ${body.healthFund || null},
        allergies = ${body.allergies || null},
        "totalSessions" = ${body.totalSessions || 12},
        "courseIds" = ${JSON.stringify(body.courseIds || [])}::jsonb,
        "courseSessions" = ${JSON.stringify(body.courseSessions || {})}::jsonb,
        "updatedAt" = ${now}
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
    await sql`DELETE FROM "Enrollment" WHERE "studentId" = ${id}`
    await sql`DELETE FROM "Attendance" WHERE "studentId" = ${id}`
    await sql`DELETE FROM "Payment" WHERE "studentId" = ${id}`
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
