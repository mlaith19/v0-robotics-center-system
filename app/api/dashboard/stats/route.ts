import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get all stats in a single query using subqueries
    const result = await sql`
      SELECT 
        (SELECT COUNT(*) FROM "Course" WHERE status = 'active') as "totalCourses",
        (SELECT COUNT(*) FROM "Student" WHERE status = 'active') as "activeStudents",
        (SELECT COUNT(*) FROM "Teacher" WHERE status = 'פעיל') as "activeTeachers",
        (SELECT COUNT(*) FROM "School") as "totalSchools",
        (SELECT COUNT(*) FROM "Enrollment") as "totalEnrollments",
        (SELECT COALESCE(SUM(amount), 0) FROM "Payment" WHERE "paymentDate" >= NOW() - INTERVAL '30 days') as "monthlyIncome",
        (SELECT COALESCE(SUM(amount), 0) FROM "Expense" WHERE date >= NOW() - INTERVAL '30 days') as "monthlyExpenses"
    `

    // Get recent activity (last 5 items)
    const recentStudents = await sql`
      SELECT id, name, "createdAt" FROM "Student" 
      ORDER BY "createdAt" DESC LIMIT 3
    `

    const recentCourses = await sql`
      SELECT id, name, "createdAt" FROM "Course" 
      ORDER BY "createdAt" DESC LIMIT 3
    `

    const stats = result[0]
    
    return Response.json({
      totalCourses: Number(stats.totalCourses) || 0,
      activeStudents: Number(stats.activeStudents) || 0,
      activeTeachers: Number(stats.activeTeachers) || 0,
      totalSchools: Number(stats.totalSchools) || 0,
      totalEnrollments: Number(stats.totalEnrollments) || 0,
      monthlyIncome: Number(stats.monthlyIncome) || 0,
      monthlyExpenses: Number(stats.monthlyExpenses) || 0,
      recentActivity: [
        ...recentStudents.map((s: any) => ({
          type: "student",
          id: s.id,
          name: s.name,
          createdAt: s.createdAt,
        })),
        ...recentCourses.map((c: any) => ({
          type: "course",
          id: c.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    })
  } catch (err) {
    console.error("GET /api/dashboard/stats error:", err)
    return Response.json({ error: "Failed to load dashboard stats" }, { status: 500 })
  }
}
