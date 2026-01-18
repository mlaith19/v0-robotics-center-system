"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Pencil, Loader2, BookOpen, Clock, DollarSign, BarChart3 } from "lucide-react"

interface Course {
  id: string
  name: string
  description: string | null
  level: string | null
  duration: number | null
  price: number | null
  status: string
  createdAt: string
  updatedAt: string
}

const levelLabels: Record<string, string> = {
  beginner: "מתחילים",
  intermediate: "מתקדמים",
  advanced: "מומחים"
}

const statusLabels: Record<string, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  draft: "טיוטה"
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  draft: "bg-yellow-100 text-yellow-800"
}

export default function CourseViewPage() {
  const params = useParams()
  const id = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`)
        if (res.ok) {
          const data = await res.json()
          setCourse(data)
        }
      } catch (err) {
        console.error("Failed to fetch course:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return <div className="p-6 text-center">לא נמצא קורס</div>
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground mt-1">פרטי קורס</p>
          </div>
        </div>

        <Link href={`/dashboard/courses/${course.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            ערוך
          </Button>
        </Link>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">משך שיעור</div>
              <div className="text-xl font-bold">{course.duration || 0} דקות</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">מחיר</div>
              <div className="text-xl font-bold">{course.price || 0} ש"ח</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">רמה</div>
              <div className="text-xl font-bold">{levelLabels[course.level || "beginner"] || course.level}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* פרטי הקורס */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex flex-row-reverse items-center justify-end gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            פרטי הקורס
          </CardTitle>
          <CardDescription className="text-right">מידע מלא על הקורס</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">שם הקורס</div>
              <div className="font-medium">{course.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">סטטוס</div>
              <Badge className={statusColors[course.status] || "bg-gray-100 text-gray-800"}>
                {statusLabels[course.status] || course.status}
              </Badge>
            </div>
          </div>

          {course.description && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">תיאור</div>
              <div className="font-medium whitespace-pre-wrap">{course.description}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">רמת הקורס</div>
              <div className="font-medium">{levelLabels[course.level || "beginner"] || course.level || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">משך שיעור</div>
              <div className="font-medium">{course.duration || 0} דקות</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">מחיר</div>
              <div className="font-medium">{course.price || 0} ש"ח</div>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">תאריך יצירה</div>
              <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "long", timeStyle: "short" }).format(new Date(course.createdAt))}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">עדכון אחרון</div>
              <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "long", timeStyle: "short" }).format(new Date(course.updatedAt))}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
