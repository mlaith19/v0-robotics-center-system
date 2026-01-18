import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`SELECT * FROM "Payment" WHERE id = ${id}`
    
    if (result.length === 0) {
      return Response.json({ error: "Payment not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/payments/[id] error:", err)
    return Response.json({ error: "Failed to load payment" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { amount, paymentDate, paymentType, description } = body

    const result = await sql`
      UPDATE "Payment"
      SET 
        amount = COALESCE(${amount}, amount),
        "paymentDate" = COALESCE(${paymentDate}, "paymentDate"),
        "paymentType" = COALESCE(${paymentType}, "paymentType"),
        description = COALESCE(${description}, description)
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Payment not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/payments/[id] error:", err)
    return Response.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`DELETE FROM "Payment" WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return Response.json({ error: "Payment not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/payments/[id] error:", err)
    return Response.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
