import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "שם משתמש וסיסמה נדרשים" },
        { status: 400 }
      )
    }

    // חיפוש המשתמש במסד הנתונים
    const users = await sql`
      SELECT u.*, r.name as role_name, r.id as role_id
      FROM "User" u
      LEFT JOIN "Role" r ON u."roleId" = r.id
      WHERE u.username = ${username} AND u.active = true
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "שם משתמש או סיסמה שגויים" },
        { status: 401 }
      )
    }

    const user = users[0]

    // בדיקת סיסמה (בפרודקשן יש להשתמש ב-bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "שם משתמש או סיסמה שגויים" },
        { status: 401 }
      )
    }

    // קבלת הרשאות המשתמש דרך התפקיד
    const permissions = await sql`
      SELECT p.name, p.resource, p.action
      FROM "Permission" p
      JOIN "RolePermission" rp ON p.id = rp."permissionId"
      WHERE rp."roleId" = ${user.role_id}
    `

    // עדכון זמן התחברות אחרון
    await sql`
      UPDATE "User" SET "updatedAt" = NOW() WHERE id = ${user.id}
    `

    // החזרת פרטי המשתמש (ללא הסיסמה)
    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role_name,
      roleId: user.role_id,
      permissions: permissions.map(p => ({
        name: p.name,
        resource: p.resource,
        action: p.action
      })),
      loginTime: new Date().toISOString()
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "שגיאה בהתחברות" },
      { status: 500 }
    )
  }
}
