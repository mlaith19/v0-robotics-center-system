import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

type Ctx = { params: Promise<{ userId: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await params

  try {
    // Find teacher linked to this user
    const teachers = await sql`
      SELECT t.*, 
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'startTime', c."startTime",
            'endTime', c."endTime"
          ))
          FROM "Course" c
          WHERE t.id = ANY(c."teacherIds")),
          '[]'
        ) as courses
      FROM "Teacher" t
      WHERE t."userId" = ${userId}
      LIMIT 1
    `

    if (teachers.length === 0) {
      return Response.json({ error: "Teacher not found" }, { status: 404 })
    }

    const teacher = teachers[0]
    const courses = teacher.courses || []
    const courseIds = courses.map((c: any) => c.id)

    return Response.json({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialty,
      courseIds,
      courses
    })
  } catch (error) {
    console.error("Error fetching teacher by user:", error)
    return Response.json({ error: "Failed to fetch teacher" }, { status: 500 })
  }
}
