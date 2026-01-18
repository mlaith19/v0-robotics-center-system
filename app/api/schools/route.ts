import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

function s(v: any) {
  if (v === undefined || v === null) return null
  const t = String(v).trim()
  return t.length ? t : null
}

export async function GET() {
  try {
    const schools = await sql`SELECT * FROM "School" ORDER BY "createdAt" DESC`
    return Response.json(schools)
  } catch (err) {
    console.error("GET /api/schools error:", err)
    return Response.json({ error: "Failed to load schools" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = s(body?.name)
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const city = s(body?.city)
    const contactPerson = s(body?.contactPerson ?? body?.contactName)
    const phone = s(body?.phone)
    const email = s(body?.email)
    const address = s(body?.address)
    const notes = s(body?.notes)

    const result = await sql`
      INSERT INTO "School" (id, name, city, "contactPerson", phone, email, address, notes, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${city}, ${contactPerson}, ${phone}, ${email}, ${address}, ${notes}, ${now}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/schools error:", err)
    return Response.json({ error: "Failed to create school" }, { status: 500 })
  }
}
