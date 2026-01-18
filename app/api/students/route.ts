import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

function cleanStr(v: any): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

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

    const name = cleanStr(body.name)
    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const emailRaw = cleanStr(body.email)
    const email = emailRaw ? emailRaw.toLowerCase() : null
    const status = cleanStr(body.status) ?? "מתעניין"
    const totalSessions = Number.isFinite(Number(body.totalSessions)) ? Number(body.totalSessions) : 12
    const idNumber = cleanStr(body.idNumber)
    const birthDate = cleanStr(body.birthDate)
    const phone = cleanStr(body.phone)
    const address = cleanStr(body.address)
    const city = cleanStr(body.city)
    const father = cleanStr(body.father)
    const mother = cleanStr(body.mother)
    const additionalPhone = cleanStr(body.additionalPhone)
    const healthFund = cleanStr(body.healthFund)
    const allergies = cleanStr(body.allergies)
    const courseIds = Array.isArray(body.courseIds) ? JSON.stringify(body.courseIds.map((x: any) => String(x))) : "[]"
    const courseSessions = body.courseSessions && typeof body.courseSessions === "object" ? JSON.stringify(body.courseSessions) : "{}"

    const result = await sql`
      INSERT INTO "Student" (
        id, name, email, status, "totalSessions", "idNumber", "birthDate", phone, address, city,
        father, mother, "additionalPhone", "healthFund", allergies, "courseIds", "courseSessions",
        "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${name}, ${email}, ${status}, ${totalSessions}, ${idNumber}, ${birthDate}, ${phone}, ${address}, ${city},
        ${father}, ${mother}, ${additionalPhone}, ${healthFund}, ${allergies}, ${courseIds}::jsonb, ${courseSessions}::jsonb,
        ${now}, ${now}
      )
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err: any) {
    console.error("POST /api/students error:", err)

    if (err.code === "23505") {
      return Response.json(
        { error: "Duplicate unique field (probably email). Try another email." },
        { status: 409 }
      )
    }

    return Response.json({ error: "Failed to create student" }, { status: 500 })
  }
}
