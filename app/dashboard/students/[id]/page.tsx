"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, User, Mail, Phone, Edit, ChevronLeft, Loader2, 
  MapPin, Calendar, CreditCard, Users, Heart, BookOpen 
} from "lucide-react"
import { StudentTabs } from "@/components/student/student-tabs"

interface Student {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  birthDate: string | null
  studentId: string | null
  parentName: string | null
  parentPhone: string | null
  notes: string | null
  schoolId: string | null
  status: string
  createdAt: string
  enrollments: any[]
  payments: any[]
  attendances: any[]
}

const statusColors: Record<string, string> = {
  "פעיל": "bg-green-100 text-green-800",
  "מתעניין": "bg-blue-100 text-blue-800",
  "השהיה": "bg-yellow-100 text-yellow-800",
  "סיים": "bg-gray-100 text-gray-800",
}

function safeText(v: any) {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  try {
    return new Intl.DateTimeFormat("he-IL", { dateStyle: "short" }).format(new Date(dateStr))
  } catch {
    return "—"
  }
}

export default function StudentViewPage() {
  const params = useParams()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${id}`)
        if (res.ok) {
          const data = await res.json()
          // Fetch related data
          const [enrollmentsRes, paymentsRes, attendanceRes] = await Promise.all([
            fetch(`/api/enrollments?studentId=${id}`),
            fetch(`/api/payments?studentId=${id}`),
            fetch(`/api/attendance?studentId=${id}`)
          ])
          
          const enrollments = enrollmentsRes.ok ? await enrollmentsRes.json() : []
          const payments = paymentsRes.ok ? await paymentsRes.json() : []
          const attendances = attendanceRes.ok ? await attendanceRes.json() : []
          
          setStudent({
            ...data,
            enrollments: Array.isArray(enrollments) ? enrollments : [],
            payments: Array.isArray(payments) ? payments : [],
            attendances: Array.isArray(attendances) ? attendances : []
          })
        }
      } catch (err) {
        console.error("Failed to fetch student:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!student) {
    return <div className="text-center py-10">לא נמצא תלמיד</div>
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="space-y-6 max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/students">
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-foreground">פרטי תלמיד</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Link href="/dashboard/students" className="hover:text-foreground transition-colors">
                  תלמידים
                </Link>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-foreground font-medium">{student.name}</span>
              </div>
            </div>
          </div>

          <Link href={`/dashboard/students/${student.id}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              ערוך תלמיד
            </Button>
          </Link>
        </div>

        {/* Student Info Header Card */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                <Badge className={statusColors[student.status] || "bg-gray-100 text-gray-800"}>
                  {student.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                {student.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{student.city}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-start gap-2 pb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">מידע אישי</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">תעודת זהות:</span>
                <span className="font-medium">{safeText(student.studentId)}</span>
              </div>
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">תאריך לידה:</span>
                <span className="font-medium">{formatDate(student.birthDate)}</span>
              </div>
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">כתובת:</span>
                <span className="font-medium">{safeText(student.address)}</span>
              </div>
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">עיר:</span>
                <span className="font-medium">{safeText(student.city)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-start gap-2 pb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">פרטי קשר</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">טלפון:</span>
                <span className="font-medium">{safeText(student.phone)}</span>
              </div>
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">אימייל:</span>
                <span className="font-medium">{safeText(student.email)}</span>
              </div>
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">טלפון הורה:</span>
                <span className="font-medium">{safeText(student.parentPhone)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Parent Info Card */}
          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-start gap-2 pb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">פרטי הורים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">שם הורה:</span>
                <span className="font-medium">{safeText(student.parentName)}</span>
              </div>
              <div className="flex flex-row-reverse justify-between items-center">
                <span className="text-muted-foreground">טלפון הורה:</span>
                <span className="font-medium">{safeText(student.parentPhone)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-start gap-2 pb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg">הערות ורגישויות</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{safeText(student.notes) || "אין הערות"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Enrollments, Payments, Attendance */}
        <Card className="p-6">
          <StudentTabs
            enrollments={student.enrollments}
            payments={student.payments}
            attendances={student.attendances}
          />
        </Card>

        {/* Created Date */}
        <div className="text-center text-sm text-muted-foreground">
          נוצר בתאריך: {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(student.createdAt))}
        </div>
      </div>
    </div>
  )
}
