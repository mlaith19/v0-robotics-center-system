"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap, Building2, Banknote, Loader2, Clock, User, ClipboardCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface CurrentUser {
  id: number
  username: string
  full_name: string
  role: string
  permissions?: string[]
}

interface StudentData {
  id: string
  name: string
  courseIds: string[]
  courses: {
    id: string
    name: string
    description?: string
    schedule?: { day: string; time: string }[]
  }[]
}

interface TeacherData {
  id: string
  name: string
  email?: string
  specialization?: string
  courseIds: string[]
  courses: {
    id: string
    name: string
    description?: string
    startTime?: string
    endTime?: string
    days?: string[]
  }[]
}

interface DashboardStats {
  totalCourses: number
  activeStudents: number
  activeTeachers: number
  totalSchools: number
  totalEnrollments: number
  monthlyIncome: number
  monthlyExpenses: number
  recentActivity: {
    type: "student" | "course"
    id: string
    name: string
    createdAt: string
  }[]
}

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `לפני ${diffMins} דקות`
  if (diffHours < 24) return `לפני ${diffHours} שעות`
  if (diffDays < 7) return `לפני ${diffDays} ימים`
  return date.toLocaleDateString("he-IL")
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  // Get current user from cookie
  useEffect(() => {
    const cookies = document.cookie.split(";")
    const sessionCookie = cookies.find((c) => c.trim().startsWith("robotics-session="))
    if (sessionCookie) {
      try {
        const sessionValue = sessionCookie.split("=")[1]
        const user = JSON.parse(decodeURIComponent(sessionValue))
        setCurrentUser(user)
      } catch (e) {
        console.error("Failed to parse session cookie")
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      const userIsAdmin = currentUser.role === "admin" || currentUser.role === "Administrator" || currentUser.role?.toLowerCase() === "admin"
      
      if (userIsAdmin) {
        // Admin sees dashboard stats
        fetch("/api/dashboard/stats")
          .then((res) => res.ok ? res.json() : null)
          .then((statsData) => {
            if (statsData) setStats(statsData)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      } else {
        // For non-admin, check if linked to student only (teacher check is done in layout)
        fetch(`/api/students/by-user/${currentUser.id}`)
          .then((res) => res.ok ? res.json() : null)
          .then((studentResult) => {
            if (studentResult) {
              setStudentData(studentResult)
            }
            setLoading(false)
          })
          .catch(() => setLoading(false))
      }
    }
  }, [currentUser])

  // If redirecting (teacher user), show loading
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check if user is admin (should always see admin dashboard)
  const isAdmin = currentUser.role === "admin" || currentUser.role === "Administrator" || currentUser.role?.toLowerCase() === "admin"

  // Student Dashboard View - show if user is linked to a student AND not an admin
  if (studentData && !isAdmin) {
    return (
      <div className="space-y-8" dir="rtl">
        <PageHeader 
          title={`שלום ${studentData.name}`}
          description="ברוך הבא למערכת"
          showLogo={true}
          centered={true}
        />

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link href={`/dashboard/students/${studentData.id}`}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20">
                  <User className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-700">הפרופיל שלי</h3>
                  <p className="text-sm text-blue-600/70">צפייה בפרטים האישיים</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/schedule">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/20">
                  <Calendar className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">לוח זמנים</h3>
                  <p className="text-sm text-green-600/70">צפייה בלוח המפגשים</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* My Courses */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            הקורסים שלי
          </h2>
          
          {studentData.courses && studentData.courses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentData.courses.map((course) => (
                <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
                    <h3 className="font-semibold text-foreground">{course.name}</h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                    )}
                    {course.schedule && course.schedule.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{course.schedule.map(s => `${s.day} ${s.time}`).join(", ")}</span>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">אין קורסים רשומים</p>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <PageHeader 
        title="דף הבית" 
        description="סקירה כללית של" 
        showLogo={true}
        useCenterNameInDescription={true}
        centered={true}
      />

      {/* Stats Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">סה"כ קורסים</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats?.totalCourses || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">תלמידים פעילים</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{stats?.activeStudents || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">מורים פעילים</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">{stats?.activeTeachers || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">בתי ספר</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-1">{stats?.totalSchools || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
              <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Row 2 - Financial */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">רישומים לקורסים</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats?.totalEnrollments || 0}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-green-50/50 dark:bg-green-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">הכנסות החודש</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                {(stats?.monthlyIncome || 0).toLocaleString()} ₪
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">הוצאות החודש</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                {(stats?.monthlyExpenses || 0).toLocaleString()} ₪
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
              <Banknote className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">פעילות אחרונה</h2>
        <div className="space-y-4">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 pb-4 ${index < stats.recentActivity.length - 1 ? "border-b border-border" : ""}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${item.type === "course" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"}`}
                >
                  {item.type === "course" ? (
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.type === "course" ? `קורס חדש נוסף: ${item.name}` : `תלמיד חדש נרשם: ${item.name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">אין פעילות אחרונה</p>
          )}
        </div>
      </Card>
    </div>
  )
}
