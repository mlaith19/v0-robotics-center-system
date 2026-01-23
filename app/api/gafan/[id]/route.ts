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
    const {
      program_number,
      name,
      valid_year,
      company_name,
      company_id,
      company_address,
      bank_name,
      bank_code,
      branch_number,
      account_number,
      operator_name,
      price_min,
      price_max,
      status,
      notes,
    } = body

    const now = new Date().toISOString()

    const result = await sql`
      UPDATE "Gafan"
      SET 
        name = ${name}, 
        "programNumber" = ${program_number || null}, 
        "validYear" = ${valid_year || null}, 
        "companyName" = ${company_name || null}, 
        "companyId" = ${company_id || null}, 
        "companyAddress" = ${company_address || null},
        "bankName" = ${bank_name || null}, 
        "bankCode" = ${bank_code || null}, 
        "branchNumber" = ${branch_number || null}, 
        "accountNumber" = ${account_number || null},
        "operatorName" = ${operator_name || null}, 
        "priceMin" = ${price_min || null}, 
        "priceMax" = ${price_max || null},
        status = ${status || "מתעניין"}, 
        notes = ${notes || null}, 
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
