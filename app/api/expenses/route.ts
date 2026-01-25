import { sql, handleDbError } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")
    const teacherId = searchParams.get("teacherId")

    // Build query using tagged template literals
    let result
    if (teacherId) {
      // Get expenses for a specific teacher
      result = await sql`SELECT * FROM "Expense" WHERE "teacherId" = ${teacherId} ORDER BY date DESC`
    } else if (startDate && endDate && category) {
      result = await sql`SELECT * FROM "Expense" WHERE date >= ${startDate} AND date <= ${endDate} AND category = ${category} ORDER BY date DESC`
    } else if (startDate && endDate) {
      result = await sql`SELECT * FROM "Expense" WHERE date >= ${startDate} AND date <= ${endDate} ORDER BY date DESC`
    } else if (startDate && category) {
      result = await sql`SELECT * FROM "Expense" WHERE date >= ${startDate} AND category = ${category} ORDER BY date DESC`
    } else if (endDate && category) {
      result = await sql`SELECT * FROM "Expense" WHERE date <= ${endDate} AND category = ${category} ORDER BY date DESC`
    } else if (startDate) {
      result = await sql`SELECT * FROM "Expense" WHERE date >= ${startDate} ORDER BY date DESC`
    } else if (endDate) {
      result = await sql`SELECT * FROM "Expense" WHERE date <= ${endDate} ORDER BY date DESC`
    } else if (category) {
      result = await sql`SELECT * FROM "Expense" WHERE category = ${category} ORDER BY date DESC`
    } else {
      result = await sql`SELECT * FROM "Expense" ORDER BY date DESC`
    }

    return Response.json(result)
  } catch (err) {
    return handleDbError(err, "GET /api/expenses")
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { description, amount, date, category, paymentMethod, isRecurring, recurringDay, teacherId } = body

    if (!description || !amount || !date || !category || !paymentMethod) {
      return Response.json({ error: "description, amount, date, category, and paymentMethod are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Expense" (id, description, amount, date, category, "paymentMethod", "isRecurring", "recurringDay", "teacherId", "createdAt")
      VALUES (${id}, ${description}, ${amount}, ${date}, ${category}, ${paymentMethod}, ${isRecurring || false}, ${recurringDay || null}, ${teacherId || null}, ${now})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    return handleDbError(err, "POST /api/expenses")
  }
}
