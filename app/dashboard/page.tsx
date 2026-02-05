import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"

export default async function DashboardPage() {
  // Get user from cookie (server-side)
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")
  
  if (!sessionCookie?.value) {
    redirect("/login")
  }
  
  let currentUser: any = null
  try {
    currentUser = JSON.parse(decodeURIComponent(sessionCookie.value))
  } catch {
    redirect("/login")
  }
  
  if (!currentUser?.id) {
    redirect("/login")
  }
  
  // Check if admin
  const isAdmin = currentUser.role === "admin" || 
                  currentUser.role === "Administrator" || 
                  currentUser.role?.toLowerCase() === "admin"
  
  // If admin, show admin dashboard
  if (isAdmin) {
    return <AdminDashboard currentUser={currentUser} />
  }
  
  // Check if user is a teacher (server-side, no rate limit issues)
  try {
    const teacherResult = await sql`
      SELECT id FROM "Teacher" WHERE "userId" = ${currentUser.id} LIMIT 1
    `
    
    if (teacherResult.length > 0) {
      // User is a teacher - redirect to their profile
      redirect(`/dashboard/teachers/${teacherResult[0].id}`)
    }
  } catch (e) {
    console.error("Error checking teacher:", e)
  }
  
  // Check if user is a student
  try {
    const studentResult = await sql`
      SELECT id, name FROM "Student" WHERE "userId" = ${currentUser.id} LIMIT 1
    `
    
    if (studentResult.length > 0) {
      // User is a student - show student dashboard
      return <StudentDashboard studentId={studentResult[0].id} currentUser={currentUser} />
    }
  } catch (e) {
    console.error("Error checking student:", e)
  }
  
  // Default: show basic user message
  return (
    <div className="p-6 text-center" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">ברוך הבא</h1>
      <p className="text-muted-foreground">אין לך הרשאות מיוחדות במערכת</p>
    </div>
  )
}
