import { sql, handleDbError } from "@/lib/db"

type Ctx = { params: Promise<{ userId: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const { userId } = await params

  try {
    // Find student by userId
    const students = await sql`
      SELECT * FROM "Student" WHERE "userId" = ${userId}
    `

    if (students.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]
    const courseIds = student.courseIds || []

    // Fetch courses for this student
    let courses: any[] = []
    if (courseIds.length > 0) {
      courses = await sql`
        SELECT id, name, description FROM "Course" WHERE id = ANY(${courseIds}::text[])
      `
    }

    return Response.json({
      ...student,
      courses,
    })
  } catch (err) {
    return handleDbError(err, "GET /api/students/by-user/[userId]")
  }
}
