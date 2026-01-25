"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap, Building2, Banknote, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"

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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <PageHeader title="דף הבית" description="סקירה כללית של מרכז הרובוטיקה" />

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
