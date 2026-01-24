import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await sql`
      SELECT g.*, s.name as "schoolName"
      FROM "Gafan" g
      LEFT JOIN "School" s ON g."schoolId" = s.id
      WHERE g.id = ${id}
    `
    
    if (result.length === 0) {
      return Response.json({ error: "Gafan program not found" }, { status: 404 })
    }
    
    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/gafan/[id] error:", err)
    return Response.json({ error: "Failed to load gafan program" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    
    const now = new Date().toISOString()

    const result = await sql`
      UPDATE "Gafan"
      SET 
        name = ${body.name || null},
        "program_number" = ${body.program_number || null},
        "valid_year" = ${body.valid_year || null},
        "company_name" = ${body.company_name || null},
        "company_id" = ${body.company_id || null},
        "company_address" = ${body.company_address || null},
        "bank_name" = ${body.bank_name || null},
        "bank_code" = ${body.bank_code || null},
        "branch_number" = ${body.branch_number || null},
        "account_number" = ${body.account_number || null},
        "operator_name" = ${body.operator_name || null},
        "price_min" = ${body.price_min || 0},
        "price_max" = ${body.price_max || null},
        status = ${body.status || "מתעניין"},
        "provider_type" = ${body.provider_type || "internal"},
        notes = ${body.notes || null},
        "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Gafan program not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/gafan/[id] error:", err)
    return Response.json({ error: "Failed to update gafan program" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await sql`DELETE FROM "Gafan" WHERE id = ${id}`
    return Response.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/gafan/[id] error:", err)
    return Response.json({ error: "Failed to delete gafan program" }, { status: 500 })
  }
}
