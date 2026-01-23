import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get all teachers - balance will be calculated when teacherId column is added to Payment table
    const teachers = await sql`
      SELECT *, 0 as "totalPaid"
      FROM "Teacher"
      ORDER BY "createdAt" DESC
    `
    return Response.json(teachers)
  } catch (err) {
    console.error("GET /api/teachers error:", err)
    return Response.json({ error: "Failed to load teachers" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name ?? "").trim()
    const email = body.email ? String(body.email).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const idNumber = body.idNumber ? String(body.idNumber).trim() : null
    const birthDate = body.birthDate || null
    const city = body.city ? String(body.city).trim() : null
    const specialty = body.specialization ? String(body.specialization).trim() : null
    const status = body.status ? String(body.status).trim() : "פעיל"
    const bio = body.bio ? String(body.bio).trim() : null
    const centerHourlyRate = body.centerHourlyRate ?? null
    const travelRate = body.travelRate ?? null
    const externalCourseRate = body.externalCourseRate ?? null

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Teacher" (
        id, name, email, phone, "idNumber", "birthDate", city, specialty, status, bio,
        "centerHourlyRate", "travelRate", "externalCourseRate", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${name}, ${email}, ${phone}, ${idNumber}, ${birthDate}, ${city}, ${specialty}, ${status}, ${bio},
        ${centerHourlyRate}, ${travelRate}, ${externalCourseRate}, ${now}, ${now}
      )
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/teachers error:", err)
    return Response.json({ error: "Failed to create teacher" }, { status: 500 })
  }
}
