import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    let query = `SELECT * FROM "Expense" WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (startDate) {
      query += ` AND date >= $${paramIndex++}`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND date <= $${paramIndex++}`
      params.push(endDate)
    }
    if (category) {
      query += ` AND category = $${paramIndex++}`
      params.push(category)
    }

    query += ` ORDER BY date DESC`

    const result = await sql(query, params)
    return Response.json(result)
  } catch (err) {
    console.error("GET /api/expenses error:", err)
    return Response.json({ error: "Failed to load expenses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { description, amount, date, category, paymentMethod, isRecurring, recurringDay } = body

    if (!description || !amount || !date || !category || !paymentMethod) {
      return Response.json({ error: "description, amount, date, category, and paymentMethod are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Expense" (id, description, amount, date, category, "paymentMethod", "isRecurring", "recurringDay", "createdAt")
      VALUES (${id}, ${description}, ${amount}, ${date}, ${category}, ${paymentMethod}, ${isRecurring || false}, ${recurringDay || null}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/expenses error:", err)
    return Response.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
