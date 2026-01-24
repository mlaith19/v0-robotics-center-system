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
    
    // Support both camelCase and snake_case field names
    const programNumber = body.programNumber || body.program_number || null
    const name = body.name
    const validYear = body.validYear || body.valid_year || null
    const companyName = body.companyName || body.company_name || null
    const companyId = body.companyId || body.company_id || null
    const companyAddress = body.companyAddress || body.company_address || null
    const bankName = body.bankName || body.bank_name || null
    const bankCode = body.bankCode || body.bank_code || null
    const branchNumber = body.branchNumber || body.branch_number || null
    const accountNumber = body.accountNumber || body.account_number || null
    const operatorName = body.operatorName || body.operator_name || null
    const priceMin = body.priceMin || body.price_min || null
    const priceMax = body.priceMax || body.price_max || null
    const status = body.status || "מתעניין"
    const providerType = body.providerType || body.provider_type || "internal"
    const notes = body.notes || null

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
        ${id}, ${name}, ${programNumber}, ${validYear}, 
        ${companyName}, ${companyId}, ${companyAddress},
        ${bankName}, ${bankCode}, ${branchNumber}, 
        ${accountNumber}, ${operatorName}, ${priceMin}, 
        ${priceMax}, ${status}, ${providerType}, ${notes}, ${now}, ${now}
      )
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (err) {
    console.error("POST /api/gafan error:", err)
    return Response.json({ error: "Failed to create gafan program" }, { status: 500 })
  }
}
