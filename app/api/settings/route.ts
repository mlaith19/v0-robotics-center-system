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
        email: "",
        website: "",
        working_hours: "",
        notes: "",
        lesson_price: 0,
        monthly_price: 0,
        registration_fee: 0,
        discount_siblings: 0,
        max_students_per_class: 0,
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
    const { 
      center_name, 
      logo, 
      phone, 
      whatsapp, 
      address,
      email,
      website,
      working_hours,
      notes,
      lesson_price,
      monthly_price,
      registration_fee,
      discount_siblings,
      max_students_per_class
    } = body

    // Check if settings exist
    const existing = await sql`SELECT id FROM center_settings WHERE id = 1`

    if (existing.length === 0) {
      // Insert new settings
      const result = await sql`
        INSERT INTO center_settings (
          id, center_name, logo, phone, whatsapp, address,
          email, website, working_hours, notes,
          lesson_price, monthly_price, registration_fee,
          discount_siblings, max_students_per_class
        )
        VALUES (
          1, ${center_name}, ${logo}, ${phone}, ${whatsapp}, ${address},
          ${email || null}, ${website || null}, ${working_hours || null}, ${notes || null},
          ${lesson_price || 0}, ${monthly_price || 0}, ${registration_fee || 0},
          ${discount_siblings || 0}, ${max_students_per_class || 0}
        )
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
            email = ${email || null},
            website = ${website || null},
            working_hours = ${working_hours || null},
            notes = ${notes || null},
            lesson_price = ${lesson_price || 0},
            monthly_price = ${monthly_price || 0},
            registration_fee = ${registration_fee || 0},
            discount_siblings = ${discount_siblings || 0},
            max_students_per_class = ${max_students_per_class || 0},
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
