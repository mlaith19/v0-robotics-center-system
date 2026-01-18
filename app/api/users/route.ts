import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const status = searchParams.get("status") || ""

    let query = `SELECT * FROM "User" WHERE 1=1`
    const params: string[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (q) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`
      params.push(`%${q}%`)
      paramIndex++
    }

    query += ` ORDER BY "createdAt" DESC`

    const users = await sql(query, params)

    return NextResponse.json(users)
  } catch (err: any) {
    console.error("GET /api/users error:", err)
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "User" (id, name, email, phone, status, permissions, "createdAt", "updatedAt")
      VALUES (${id}, ${body.name.trim()}, ${body.email.trim()}, ${body.phone?.trim() || null}, ${body.status || "active"}, ${JSON.stringify(body.permissions || [])}, ${now}, ${now})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (err: any) {
    console.error("POST /api/users error:", err)
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
