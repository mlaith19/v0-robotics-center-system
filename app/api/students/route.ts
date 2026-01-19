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
    const studentId = cleanStr(body.studentId)
    const birthDate = cleanStr(body.birthDate)
    const phone = cleanStr(body.phone)
    const address = cleanStr(body.address)
    const city = cleanStr(body.city)
    const parentName = cleanStr(body.parentName)
    const parentPhone = cleanStr(body.parentPhone)
    const schoolId = cleanStr(body.schoolId)
    const notes = cleanStr(body.notes)

    const result = await sql`
      INSERT INTO "Student" (
        id, name, email, status, "studentId", "birthDate", phone, address, city,
        "parentName", "parentPhone", "schoolId", notes,
        "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${name}, ${email}, ${status}, ${studentId}, ${birthDate}, ${phone}, ${address}, ${city},
        ${parentName}, ${parentPhone}, ${schoolId}, ${notes},
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
