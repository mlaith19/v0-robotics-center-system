import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

type Ctx = { params: Promise<{ id: string }> }

function cleanStr(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length ? s : null
}

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    const result = await sql`SELECT * FROM "School" WHERE id = ${id}`

    if (result.length === 0) {
      return Response.json({ error: "School not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("GET /api/schools/[id] error:", err)
    return Response.json({ error: "Failed to load school" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json()

  const name = cleanStr(body.name)
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 })
  }

  try {
    const now = new Date().toISOString()
    const city = cleanStr(body.city)
    const address = cleanStr(body.address)
    const phone = cleanStr(body.contactPhone)
    const email = cleanStr(body.email)
    const contactPerson = cleanStr(body.contactPerson ?? body.contactName)
    const status = cleanStr(body.status) || "active"
    const institutionCode = cleanStr(body.institutionCode)
    const schoolType = cleanStr(body.schoolType)
    const schoolPhone = cleanStr(body.schoolPhone)
    const bankName = cleanStr(body.bankName)
    const bankCode = cleanStr(body.bankCode)
    const bankBranch = cleanStr(body.bankBranch)
    const bankAccount = cleanStr(body.bankAccount)
    const notes = cleanStr(body.notes)

    const result = await sql`
      UPDATE "School"
      SET name = ${name}, city = ${city}, address = ${address}, phone = ${phone}, 
          email = ${email}, "contactPerson" = ${contactPerson}, status = ${status},
          "institutionCode" = ${institutionCode}, "schoolType" = ${schoolType},
          "schoolPhone" = ${schoolPhone}, "bankName" = ${bankName}, "bankCode" = ${bankCode},
          "bankBranch" = ${bankBranch}, "bankAccount" = ${bankAccount}, notes = ${notes},
          "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "School not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (err) {
    console.error("PUT /api/schools/[id] error:", err)
    return Response.json({ error: "Failed to update school" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params

  try {
    await sql`DELETE FROM "School" WHERE id = ${id}`
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("DELETE /api/schools/[id] error:", err)
    return Response.json({ error: "Failed to delete school" }, { status: 500 })
  }
}
