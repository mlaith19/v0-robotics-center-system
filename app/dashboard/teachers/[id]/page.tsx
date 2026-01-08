"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  ArrowRight,
  GraduationCap,
  Mail,
  Phone,
  Pencil,
  BookOpen,
  Banknote,
  Calendar,
  CheckCircle2,
  XCircle,
  DollarSign,
  ChevronLeft,
} from "lucide-react"

interface Teacher {
  id: number
  name: string
  email: string
  phone: string
  specialization: string
  status: string
  joinDate: string
  bio?: string
  courses?: string[]
  centerHourlyRate: number
  travelRate: number
  externalCourseRate: number
}

interface Course {
  id: number
  name: string
  teachers: number[]
  weekdays: string[]
  startTime: string
  endTime: string
}

export default function TeacherDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (typeof window !== "undefined" && params.id) {
      const saved = localStorage.getItem("robotics-teachers")
      if (saved) {
        const teachers: Teacher[] = JSON.parse(saved)
        const found = teachers.find((t) => t.id === Number(params.id))
        setTeacher(found || null)
      }

      const savedCourses = localStorage.getItem("robotics-courses")
      if (savedCourses) {
        const allCourses: Course[] = JSON.parse(savedCourses)
        const teacherCourses = allCourses.filter((c) => c.teachers && c.teachers.includes(Number(params.id)))
        setCourses(teacherCourses)
      }
    }
  }, [params.id])

  if (!teacher) {
    return <div>טוען...</div>
  }

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">פרטי מורה</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Link href="/dashboard/teachers" className="hover:text-foreground transition-colors">
                מורים
              </Link>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground font-medium">{teacher.name}</span>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            ערוך מורה
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="general" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">כללי</TabsTrigger>
          <TabsTrigger value="courses">קורסים משויכים</TabsTrigger>
          <TabsTrigger value="payments">תשלומים</TabsTrigger>
          <TabsTrigger value="attendance">נוכחות</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{teacher.name}</h3>
                <p className="text-muted-foreground">{teacher.specialization}</p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                    teacher.status === "פעיל" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {teacher.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  אימייל
                </p>
                <p className="text-foreground">{teacher.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  טלפון
                </p>
                <p className="text-foreground">{teacher.phone}</p>
              </div>
              {teacher.bio && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">אודות</p>
                  <p className="text-foreground">{teacher.bio}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  תאריך הצטרפות
                </p>
                <p className="text-foreground">{teacher.joinDate}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                תעריפים
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">₪{teacher.centerHourlyRate}</p>
                  <p className="text-xs text-muted-foreground mt-1">שעה במרכז</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">₪{teacher.travelRate}</p>
                  <p className="text-xs text-muted-foreground mt-1">נסיעות</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">₪{teacher.externalCourseRate}</p>
                  <p className="text-xs text-muted-foreground mt-1">קורס חיצוני</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              קורסים משויכים
            </h3>
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground">{course.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{course.weekdays.join(", ")}</span>
                      <span>
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">אין קורסים משויכים למורה זה</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-medium text-muted-foreground">סה״כ תשלומים</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">₪12,500</p>
              <p className="text-xs text-muted-foreground mt-1">החודש</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-medium text-muted-foreground">שולם</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">₪8,000</p>
              <p className="text-xs text-muted-foreground mt-1">64% מהסכום</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-medium text-muted-foreground">ממתין</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">₪4,500</p>
              <p className="text-xs text-muted-foreground mt-1">36% מהסכום</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">היסטוריית תשלומים</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">תשלום חודש {13 - i}/2024</p>
                      <p className="text-sm text-muted-foreground">01/{13 - i}/2024</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">₪{4000 + i * 500}</p>
                    <span className="text-xs text-green-500">שולם</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-medium text-muted-foreground">נוכחות</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">95%</p>
              <p className="text-xs text-muted-foreground mt-1">38 מתוך 40 שיעורים</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-medium text-muted-foreground">היעדרויות</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-xs text-muted-foreground mt-1">החודש</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium text-muted-foreground">שיעורים</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">40</p>
              <p className="text-xs text-muted-foreground mt-1">החודש</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">רשומת נוכחות אחרונה</h3>
            <div className="space-y-3">
              {[
                { date: "07/01/2026", course: "מבוא לרובוטיקה", status: "נוכח" },
                { date: "06/01/2026", course: "Arduino למתקדמים", status: "נוכח" },
                { date: "05/01/2026", course: "מבוא לרובוטיקה", status: "נעדר" },
                { date: "04/01/2026", course: "Arduino למתקדמים", status: "נוכח" },
                { date: "03/01/2026", course: "מבוא לרובוטיקה", status: "נוכח" },
              ].map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{record.course}</p>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      record.status === "נוכח" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
