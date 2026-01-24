import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const { id } = await params

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (body.phone !== undefined) {
      updates.push(`phone = $${paramIndex}`)
      values.push(body.phone?.trim() || null)
      paramIndex++
    }

    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(body.status || "active")
      paramIndex++
    }

    if (body.role !== undefined) {
      updates.push(`role = $${paramIndex}`)
      values.push(body.role)
      paramIndex++
    }

    if (body.permissions !== undefined) {
      updates.push(`permissions = $${paramIndex}`)
      values.push(JSON.stringify(body.permissions))
      paramIndex++
    }

    updates.push(`"updatedAt" = $${paramIndex}`)
    values.push(new Date().toISOString())
    paramIndex++

    values.push(id)

    const query = `UPDATE "User" SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`
    const result = await sql(query, values)

    return NextResponse.json(result[0])
  } catch (err: any) {
    console.error("PATCH /api/users/[id] error:", err)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await sql`DELETE FROM "User" WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("DELETE /api/users/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
