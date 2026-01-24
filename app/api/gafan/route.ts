import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`SELECT * FROM "Gafan" ORDER BY "createdAt" DESC`
    return Response.json(result)
  } catch (err) {
    console.error("GET /api/gafan error:", err)
    return Response.json({ error: "Failed to load gafan programs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("[v0] POST /api/gafan body:", body)
    
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
      provider_type,
      notes,
    } = body

    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await sql`
      INSERT INTO "Gafan" (
        id, name, "programNumber", "validYear", "companyName", "companyId", 
        "companyAddress", "bankName", "bankCode", "branchNumber", "accountNumber",
        "operatorName", "priceMin", "priceMax", status, "provider_type", notes, "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${name}, ${program_number || null}, ${valid_year || null}, 
        ${company_name || null}, ${company_id || null}, ${company_address || null},
        ${bank_name || null}, ${bank_code || null}, ${branch_number || null}, 
        ${account_number || null}, ${operator_name || null}, ${price_min || null}, 
        ${price_max || null}, ${status || "מתעניין"}, ${provider_type || "internal"}, ${notes || null}, ${now}, ${now}
      )
      RETURNING *
    `

    console.log("[v0] Gafan created:", result[0])
    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/gafan error:", err)
    return Response.json({ error: "Failed to create gafan program" }, { status: 500 })
  }
}
