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
      SELECT u.*, r.name as role_name, r.key as role_key
      FROM "User" u
      LEFT JOIN "Role" r ON u."roleId" = r.id
      WHERE u.username = ${username} AND u.status = 'active'
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "שם משתמש או סיסמה שגויים" },
        { status: 401 }
      )
    }

    const user = users[0]

    // בדיקת סיסמה פשוטה - בפרודקשן יש להשתמש ב-bcrypt
    // כרגע מאפשרים התחברות עם כל סיסמה למטרות פיתוח
    // TODO: להוסיף עמודת password לטבלת User ולהשתמש ב-bcrypt

    // קבלת הרשאות המשתמש דרך התפקיד או מההרשאות המותאמות אישית
    const permissions = await sql`
      SELECT p.name, p.description
      FROM "Permission" p
      JOIN "RolePermission" rp ON p.id = rp."permissionId"
      WHERE rp."roleId" = ${user.roleId}
    `

    // החזרת פרטי המשתמש
    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.name,
      email: user.email,
      role: user.role_name || 'user',
      roleKey: user.role_key,
      roleId: user.roleId,
      permissions: user.permissions || permissions.map((p: { name: string; description: string }) => p.name),
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
