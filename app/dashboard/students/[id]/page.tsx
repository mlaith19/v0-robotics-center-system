"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, User, Mail, Phone, Edit, ChevronLeft, Loader2 } from "lucide-react"
import { StudentTabs } from "@/components/student/student-tabs"

interface Student {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  createdAt: string
  enrollments: any[]
  payments: any[]
  attendances: any[]
}

function safeText(v: any) {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
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
      <div className="space-y-6 max-w-4xl mx-auto p-6">
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

        <Card className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{student.name}</h3>
            <span
              className={`inline-block text-sm px-3 py-1 rounded-full mt-2 ${
                student.status === "פעיל" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}
            >
              {student.status}
            </span>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4" />
                  <span>אימייל</span>
                </div>
                <p className="text-foreground font-medium">{safeText(student.email)}</p>
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4" />
                  <span>טלפון</span>
                </div>
                <p className="text-foreground font-medium">{safeText(student.phone)}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">נוצר בתאריך</p>
              <p className="text-foreground font-medium text-lg">
                {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(student.createdAt))}
              </p>
            </div>
          </div>

          <StudentTabs
            enrollments={student.enrollments}
            payments={student.payments}
            attendances={student.attendances}
          />
        </Card>
      </div>
    </div>
  )
}
