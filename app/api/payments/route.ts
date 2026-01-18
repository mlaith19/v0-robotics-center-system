import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let result
    if (studentId && startDate && endDate) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."studentId" = ${studentId} AND p."paymentDate" >= ${startDate} AND p."paymentDate" <= ${endDate}
        ORDER BY p."paymentDate" DESC
      `
    } else if (studentId && startDate) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."studentId" = ${studentId} AND p."paymentDate" >= ${startDate}
        ORDER BY p."paymentDate" DESC
      `
    } else if (studentId && endDate) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."studentId" = ${studentId} AND p."paymentDate" <= ${endDate}
        ORDER BY p."paymentDate" DESC
      `
    } else if (startDate && endDate) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."paymentDate" >= ${startDate} AND p."paymentDate" <= ${endDate}
        ORDER BY p."paymentDate" DESC
      `
    } else if (studentId) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."studentId" = ${studentId}
        ORDER BY p."paymentDate" DESC
      `
    } else if (startDate) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."paymentDate" >= ${startDate}
        ORDER BY p."paymentDate" DESC
      `
    } else if (endDate) {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        WHERE p."paymentDate" <= ${endDate}
        ORDER BY p."paymentDate" DESC
      `
    } else {
      result = await sql`
        SELECT p.*, s.name as "studentName"
        FROM "Payment" p
        LEFT JOIN "Student" s ON p."studentId" = s.id
        ORDER BY p."paymentDate" DESC
      `
    }

    return Response.json(result)
  } catch (err) {
    console.error("GET /api/payments error:", err)
    return Response.json({ error: "Failed to load payments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, amount, date, paymentMethod, description } = body

    console.log("[v0] POST /api/payments body:", body)

    if (!amount || !date) {
      return Response.json({ error: "amount and date are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Payment" (id, "studentId", amount, "paymentDate", "paymentType", description, "createdAt")
      VALUES (${id}, ${studentId || null}, ${amount}, ${date}, ${paymentMethod || 'cash'}, ${description || null}, ${now})
      RETURNING *
    `

    console.log("[v0] Payment created:", result[0])
    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/payments error:", err)
    return Response.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
