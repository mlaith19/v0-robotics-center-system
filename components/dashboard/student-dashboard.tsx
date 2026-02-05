"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"

interface CurrentUser {
  id: number
  username: string
  full_name: string
  role: string
}

interface StudentData {
  id: string
  name: string
  courses: {
    id: string
    name: string
    description?: string
    schedule?: { day: string; time: string }[]
  }[]
}

export function StudentDashboard({ studentId, currentUser }: { studentId: string, currentUser: CurrentUser }) {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/students/${studentId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setStudentData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [studentId])

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
        title={`שלום ${studentData?.name || currentUser.full_name || currentUser.username}`}
        description="הקורסים והשיעורים שלך"
      />

      {/* Courses */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">הקורסים שלי</h2>
        {studentData?.courses && studentData.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentData.courses.map((course) => (
              <Card key={course.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.name}</h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                    )}
                    {course.schedule && course.schedule.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {course.schedule.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{s.day}</span>
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{s.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">לא נמצאו קורסים רשומים</p>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/schedule">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">לוח זמנים</h3>
                <p className="text-sm text-muted-foreground">צפה בלוח הזמנים שלך</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
