import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const students = await sql`SELECT * FROM "Student" ORDER BY "createdAt" DESC`
    return Response.json(students)
  } catch (err) {
    console.error("GET /api/students error:", err)
    return Response.json({ error: "Failed to load students" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name) {
      return Response.json({ error: "name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Student" (
        id, name, email, phone, address, city, status, "birthDate",
        "idNumber", father, mother, "additionalPhone", "healthFund", allergies,
        "totalSessions", "courseIds", "courseSessions", "createdAt", "updatedAt"
      )
      VALUES (
        ${id},
        ${body.name},
        ${body.email || null},
        ${body.phone || null},
        ${body.address || null},
        ${body.city || null},
        ${body.status || 'מתעניין'},
        ${body.birthDate || null},
        ${body.idNumber || null},
        ${body.father || null},
        ${body.mother || null},
        ${body.additionalPhone || null},
        ${body.healthFund || null},
        ${body.allergies || null},
        ${body.totalSessions || 12},
        ${JSON.stringify(body.courseIds || [])}::jsonb,
        ${JSON.stringify(body.courseSessions || {})}::jsonb,
        ${now},
        ${now}
      )
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err: any) {
    console.error("POST /api/students error:", err)
    return Response.json({ error: err?.message || "Failed to create student" }, { status: 500 })
  }
}
