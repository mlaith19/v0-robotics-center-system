import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

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

    // User account fields
    const createUserAccount = body.createUserAccount === true
    const username = body.username ? String(body.username).trim() : null
    const password = body.password ? String(body.password) : null

    // Validate user account fields if creating account
    if (createUserAccount) {
      if (!username) {
        return Response.json({ error: "username is required for user account" }, { status: 400 })
      }
      if (!password || password.length < 4) {
        return Response.json({ error: "password must be at least 4 characters" }, { status: 400 })
      }

      // Check if username already exists
      const existingUser = await sql`SELECT id FROM "User" WHERE username = ${username}`
      if (existingUser.length > 0) {
        return Response.json({ error: "שם המשתמש כבר קיים במערכת" }, { status: 409 })
      }
    }

    const studentId = crypto.randomUUID()
    const now = new Date().toISOString()

    let userId = null

    // Create user account if requested
    if (createUserAccount && username && password) {
      userId = crypto.randomUUID()
      const hashedPassword = await bcrypt.hash(password, 10)

      // Get student role permissions (limited access)
      const studentPermissions = [
        "settings.home",
        "schedule.view",
      ]

      await sql`
        INSERT INTO "User" (id, name, email, username, password, phone, status, role, permissions, "createdAt", "updatedAt")
        VALUES (${userId}, ${body.name}, ${body.email || null}, ${username}, ${hashedPassword}, ${body.phone || null}, 'active', 'student', ${JSON.stringify(studentPermissions)}, ${now}, ${now})
      `
    }

    const result = await sql`
      INSERT INTO "Student" (
        id, name, email, phone, address, city, status, "birthDate",
        "idNumber", father, mother, "additionalPhone", "healthFund", allergies,
        "totalSessions", "courseIds", "courseSessions", "userId", "createdAt", "updatedAt"
      )
      VALUES (
        ${studentId},
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
        ${userId},
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
