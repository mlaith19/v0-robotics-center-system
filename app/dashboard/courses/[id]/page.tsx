"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Pencil, Loader2 } from "lucide-react"

interface Course {
  id: string
  name: string
  createdAt: string
  updatedAt: string
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
            <h1 className="text-3xl font-bold">פרטי קורס</h1>
            <p className="text-muted-foreground mt-1">{course.name}</p>
          </div>
        </div>

        <Link href={`/dashboard/courses/${course.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            ערוך
          </Button>
        </Link>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">שם</div>
          <div className="text-xl font-semibold">{course.name}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">נוצר</div>
            <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(course.createdAt))}</div>
          </div>
          <div>
            <div className="text-muted-foreground">עודכן</div>
            <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(course.updatedAt))}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
