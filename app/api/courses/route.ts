import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const courses = await sql`SELECT * FROM "Course" ORDER BY "createdAt" DESC`
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

    const result = await sql`
      INSERT INTO "Course" (id, name, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${now}, ${now})
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
