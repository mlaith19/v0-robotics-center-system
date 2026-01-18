import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const settings = await sql`
      SELECT * FROM center_settings WHERE id = 1
    `
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        id: 1,
        center_name: "",
        logo: "",
        phone: "",
        whatsapp: "",
        address: "",
      })
    }
    
    return NextResponse.json(settings[0])
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { center_name, logo, phone, whatsapp, address } = body

    // Check if settings exist
    const existing = await sql`SELECT id FROM center_settings WHERE id = 1`

    if (existing.length === 0) {
      // Insert new settings
      const result = await sql`
        INSERT INTO center_settings (id, center_name, logo, phone, whatsapp, address)
        VALUES (1, ${center_name}, ${logo}, ${phone}, ${whatsapp}, ${address})
        RETURNING *
      `
      return NextResponse.json(result[0])
    } else {
      // Update existing settings
      const result = await sql`
        UPDATE center_settings
        SET center_name = ${center_name},
            logo = ${logo},
            phone = ${phone},
            whatsapp = ${whatsapp},
            address = ${address},
            updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `
      return NextResponse.json(result[0])
    }
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
