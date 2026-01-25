import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

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

    const users = await sql.query(query, params)

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

    if (!body.username || !body.password) {
      return NextResponse.json({ error: "username and password are required" }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await sql`SELECT id FROM "User" WHERE username = ${body.username.trim()}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "User" (id, name, email, username, password, phone, status, role, permissions, "createdAt", "updatedAt")
      VALUES (${id}, ${body.name.trim()}, ${body.email.trim()}, ${body.username.trim()}, ${hashedPassword}, ${body.phone?.trim() || null}, ${body.status || "active"}, ${body.role || "other"}, ${JSON.stringify(body.permissions || [])}, ${now}, ${now})
      RETURNING id, name, email, username, phone, status, role, permissions, "createdAt", "updatedAt"
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (err: any) {
    console.error("POST /api/users error:", err)
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
