"use client"

import { useEffect } from "react"
import { useState } from "react"
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
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Student {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  birthDate: string | null
  idNumber: string | null
  father: string | null
  mother: string | null
  additionalPhone: string | null
  healthFund: string | null
  allergies: string | null
  status: string
  totalSessions: number | null
  courseIds: string[]
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

  // Use SWR for all data fetching
  const { data: studentData, isLoading: studentLoading, mutate: mutateStudent } = useSWR(
    id ? `/api/students/${id}` : null,
    fetcher
  )
  const { data: coursesData } = useSWR("/api/courses", fetcher)
  const { data: enrollmentsData, mutate: mutateEnrollments } = useSWR(
    id ? `/api/enrollments?studentId=${id}` : null,
    fetcher
  )
  const { data: paymentsData, mutate: mutatePayments } = useSWR(
    id ? `/api/payments?studentId=${id}` : null,
    fetcher
  )
  const { data: attendancesData, mutate: mutateAttendances } = useSWR(
    id ? `/api/attendance?studentId=${id}` : null,
    fetcher
  )

  const loading = studentLoading
  const courses = Array.isArray(coursesData) ? coursesData : []
  
  // Combine student data with related data
  const student = studentData ? {
    ...studentData,
    courseIds: studentData.courseIds || [],
    enrollments: Array.isArray(enrollmentsData) ? enrollmentsData : [],
    payments: Array.isArray(paymentsData) ? paymentsData : [],
    attendances: Array.isArray(attendancesData) ? attendancesData : []
  } : null

  // Function to refresh all data
  const refreshAllData = () => {
    mutateStudent()
    mutateEnrollments()
    mutatePayments()
    mutateAttendances()
  }

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

  // Get enrolled course names
  const enrolledCourseNames = (student.courseIds || [])
    .map(cid => courses.find(c => c.id === cid)?.name)
    .filter(Boolean)

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

        {/* Student Name Header */}
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
            </div>
          </div>
        </Card>

        {/* Tabs - including Profile tab with all details */}
        <Card className="p-6">
          <StudentTabs
            studentId={id}
            student={student}
            enrollments={student.enrollments}
            payments={student.payments}
            attendances={student.attendances}
            enrolledCourseNames={enrolledCourseNames}
            onPaymentAdded={refreshAllData}
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
