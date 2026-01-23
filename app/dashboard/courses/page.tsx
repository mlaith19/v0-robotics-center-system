"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, Pencil, Eye, Plus, RefreshCw, Users, Clock, Calendar, 
  LayoutGrid, List, User, DollarSign, AlertCircle, CheckCircle2
} from "lucide-react"

type Course = {
  id: string
  name: string
  description?: string
  courseNumber?: string
  category?: string
  courseType?: string
  location?: string
  level?: string
  duration?: string
  price?: number
  status?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  daysOfWeek?: string[]
  teacherIds?: string[]
  createdAt: string
  updatedAt: string
  enrollmentCount?: number
  totalPaid?: number
  paidCount?: number
  teachers?: { id: string; name: string }[]
}

type Teacher = {
  id: string
  name: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const [coursesRes, teachersRes] = await Promise.all([
        fetch("/api/courses", { cache: "no-store" }),
        fetch("/api/teachers", { cache: "no-store" })
      ])
      if (!coursesRes.ok) throw new Error(`Failed to load courses (${coursesRes.status})`)
      const coursesData = await coursesRes.json()
      setCourses(coursesData ?? [])
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData ?? [])
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    const ok = confirm("למחוק את הקורס?")
    if (!ok) return
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert(`מחיקה נכשלה (${res.status})`)
      return
    }
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return courses
    return courses.filter((c) => 
      c.name.toLowerCase().includes(s) || 
      c.description?.toLowerCase().includes(s) ||
      c.category?.toLowerCase().includes(s)
    )
  }, [q, courses])

  const getTeacherNames = (teacherIds?: string[]) => {
    if (!teacherIds || teacherIds.length === 0) return null
    return teacherIds
      .map(id => teachers.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  const getDaysLabel = (days?: string[]) => {
    if (!days || days.length === 0) return null
    const dayNames: Record<string, string> = {
      sunday: "ראשון",
      monday: "שני",
      tuesday: "שלישי",
      wednesday: "רביעי",
      thursday: "חמישי",
      friday: "שישי",
      saturday: "שבת"
    }
    return days.map(d => dayNames[d] || d).join(", ")
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">פעיל</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">טיוטה</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">לא פעיל</Badge>
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">בקרוב</Badge>
      default:
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">פעיל</Badge>
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return null
    return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date))
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-right">
          <h1 className="text-3xl font-bold">קורסים</h1>
          <p className="text-muted-foreground mt-1">נהל את כל הקורסים במרכז</p>
        </div>

        <div className="flex gap-2 items-center">
          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Link href="/dashboard/courses/new">
            <Button className="gap-2 bg-primary">
              <Plus className="h-4 w-4" />
              קורס חדש
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חפש לפי שם קורס..."
            className="max-w-md text-right"
            dir="rtl"
          />
          <Button variant="outline" onClick={load} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            רענן
          </Button>
          <div className="text-sm text-muted-foreground mr-auto">
            סה״כ: {filtered.length} קורסים
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="text-muted-foreground text-center py-12">טוען...</div>
      ) : err ? (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-red-700 font-semibold">שגיאה</div>
          <div className="text-red-700/80 mt-1">{err}</div>
          <div className="mt-4">
            <Button variant="outline" onClick={load}>נסה שוב</Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <div className="text-lg">אין קורסים</div>
          <Link href="/dashboard/courses/new">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              הוסף קורס ראשון
            </Button>
          </Link>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filtered.map((c) => (
            <Card key={c.id} className="p-5 space-y-4 hover:shadow-lg transition-shadow">
              {/* Header with status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  {c.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  )}
                </div>
                {getStatusBadge(c.status)}
              </div>

              {/* Info rows */}
              <div className="space-y-2 text-sm">
                {/* Students count */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{c.enrollmentCount || 0} תלמידים</span>
                </div>

                {/* Duration */}
                {c.duration && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{c.duration}</span>
                  </div>
                )}

                {/* Days */}
                {c.daysOfWeek && c.daysOfWeek.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{getDaysLabel(c.daysOfWeek)}</span>
                  </div>
                )}

                {/* Teachers */}
                {getTeacherNames(c.teacherIds) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 text-purple-500" />
                    <span>{getTeacherNames(c.teacherIds)}</span>
                  </div>
                )}
              </div>

              {/* Payment status */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 text-xs mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>שילמו</span>
                  </div>
                  <div className="font-bold text-green-700">{c.paidCount || 0}/{c.enrollmentCount || 0}</div>
                </div>
                <div className={`rounded-lg p-3 text-center ${
                  ((c.enrollmentCount || 0) * (c.price || 0) - (c.totalPaid || 0)) > 0 
                    ? "bg-red-50" 
                    : "bg-green-50"
                }`}>
                  <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${
                    ((c.enrollmentCount || 0) * (c.price || 0) - (c.totalPaid || 0)) > 0 
                      ? "text-red-600" 
                      : "text-green-600"
                  }`}>
                    <AlertCircle className="h-3 w-3" />
                    <span>יתרה</span>
                  </div>
                  <div className={`font-bold ${
                    ((c.enrollmentCount || 0) * (c.price || 0) - (c.totalPaid || 0)) > 0 
                      ? "text-red-700" 
                      : "text-green-700"
                  }`}>
                    {((c.enrollmentCount || 0) * (c.price || 0) - (c.totalPaid || 0)).toLocaleString()}₪
                  </div>
                </div>
              </div>

              {/* Price and dates */}
              <div className="border-t pt-3 space-y-2">
                {c.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{c.price}₪</span>
                    <span className="text-sm text-muted-foreground">מחיר:</span>
                  </div>
                )}
                
                {(c.startDate || c.endDate) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatDate(c.startDate)} - {formatDate(c.endDate)}
                    </span>
                    <span className="text-muted-foreground">תאריכים:</span>
                  </div>
                )}

                {(c.startTime || c.endTime) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {c.startTime} - {c.endTime}
                    </span>
                    <span className="text-muted-foreground">שעות:</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Link href={`/dashboard/courses/${c.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Pencil className="h-4 w-4" />
                    ערוך
                  </Button>
                </Link>

                <Link href={`/dashboard/courses/${c.id}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Eye className="h-4 w-4" />
                    צפה
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
