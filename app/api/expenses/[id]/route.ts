import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`DELETE FROM "Expense" WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return Response.json({ error: "Expense not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/expenses/[id] error:", err)
    return Response.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
