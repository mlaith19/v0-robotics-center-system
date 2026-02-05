"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, Building2, Banknote, Loader2, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"

interface CurrentUser {
  id: number
  username: string
  full_name: string
  role: string
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
    name: string
    action: string
    date: string
  }[]
}

export function AdminDashboard({ currentUser }: { currentUser: CurrentUser }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setStats(data)
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
    <div className="p-6" dir="rtl">
      <PageHeader
        title="דף הבית"
        description={`סקירה כללית של THINK DIFFERENT CENTER`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/courses">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">סה"כ קורסים</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalCourses ?? 0}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/students">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">תלמידים פעילים</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeStudents ?? 0}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/teachers">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">מורים פעילים</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.activeTeachers ?? 0}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/schools">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">בתי ספר</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.totalSchools ?? 0}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">רישומים לקורסים</p>
              <p className="text-2xl font-bold">{stats?.totalEnrollments ?? 0}</p>
            </div>
          </div>
        </Card>

        <Link href="/dashboard/cashier">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">הכנסות החודש</p>
                <p className="text-2xl font-bold text-emerald-600">₪ {stats?.monthlyIncome ?? 0}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Banknote className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">הוצאות החודש</p>
              <p className="text-2xl font-bold text-red-600">₪ {stats?.monthlyExpenses ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">פעילות אחרונה</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className={`p-2 rounded-full ${activity.type === "student" ? "bg-green-100" : "bg-blue-100"}`}>
                  {activity.type === "student" ? (
                    <Users className="h-4 w-4 text-green-600" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <span className="font-medium">{activity.name}</span>
                  <span className="text-muted-foreground"> - {activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground mr-auto">{activity.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">אין פעילות אחרונה</p>
        )}
      </Card>
    </div>
  )
}
