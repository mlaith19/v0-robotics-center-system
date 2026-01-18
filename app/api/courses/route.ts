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
    const description = body.description ? String(body.description).trim() : null
    const level = body.level ? String(body.level).trim() : "beginner"
    const duration = body.duration ? Number(body.duration) : 60
    const price = body.price ? Number(body.price) : 0
    const status = body.status ? String(body.status).trim() : "active"

    const result = await sql`
      INSERT INTO "Course" (id, name, description, level, duration, price, status, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${description}, ${level}, ${duration}, ${price}, ${status}, ${now}, ${now})
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
