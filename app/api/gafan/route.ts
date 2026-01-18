import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`SELECT * FROM "Gafan" ORDER BY "createdAt" DESC`
    return Response.json(result)
  } catch (err) {
    console.error("GET /api/gafan error:", err)
    return Response.json({ error: "Failed to load gafan programs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, schoolId, startDate, endDate, price, status } = body

    if (!name || !schoolId) {
      return Response.json({ error: "name and schoolId are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Gafan" (id, name, description, "schoolId", "startDate", "endDate", price, status, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${description || null}, ${schoolId}, ${startDate || null}, ${endDate || null}, ${price || 0}, ${status || "active"}, ${now}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/gafan error:", err)
    return Response.json({ error: "Failed to create gafan program" }, { status: 500 })
  }
}
