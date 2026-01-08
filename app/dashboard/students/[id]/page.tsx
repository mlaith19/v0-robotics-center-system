"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  BookOpen,
  DollarSign,
  CalendarCheck,
  Receipt,
  Edit,
  ChevronLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function StudentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("robotics-students") || "[]")
    const foundStudent = students.find((s: any) => s.id === Number.parseInt(params.id))
    setStudent(foundStudent)

    const savedCourses = JSON.parse(localStorage.getItem("robotics-courses") || "[]")
    setCourses(savedCourses)
  }, [params.id])

  if (!student) {
    return <div className="text-center py-8">טוען...</div>
  }

  const getStudentCourses = () => {
    return courses.filter((course: any) => {
      const studentsList = course.students || []
      return Array.isArray(studentsList) && studentsList.some((s: any) => s.name === student.name)
    })
  }

  const getStudentPayments = () => {
    return [
      { id: 1, date: "01/01/2024", amount: 1200, status: "שולם", method: "אשראי" },
      { id: 2, date: "01/02/2024", amount: 1200, status: "שולם", method: "העברה בנקאית" },
      { id: 3, date: "01/03/2024", amount: 1200, status: "ממתין", method: "אשראי" },
    ]
  }

  const getStudentAttendance = () => {
    return [
      { id: 1, date: "05/01/2024", course: "מבוא לרובוטיקה", status: "נוכח", hours: 2 },
      { id: 2, date: "07/01/2024", course: "מבוא לרובוטיקה", status: "נוכח", hours: 2 },
      { id: 3, date: "12/01/2024", course: "מבוא לרובוטיקה", status: "נעדר", hours: 0 },
      { id: 4, date: "14/01/2024", course: "מבוא לרובוטיקה", status: "נוכח", hours: 2 },
      { id: 5, date: "19/01/2024", course: "מבוא לרובוטיקה", status: "נוכח", hours: 2 },
    ]
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowRight className="h-5 w-5" />
            </Button>
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

        <Card className="p-6">
          <Tabs defaultValue="general" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">כללי</TabsTrigger>
              <TabsTrigger value="courses">קורסים</TabsTrigger>
              <TabsTrigger value="payments">תשלומים</TabsTrigger>
              <TabsTrigger value="attendance">נוכחות</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="flex flex-col items-center text-center py-4">
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
                    <p className="text-foreground font-medium">{student.email}</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Phone className="h-4 w-4" />
                      <span>טלפון</span>
                    </div>
                    <p className="text-foreground font-medium">{student.phone}</p>
                  </div>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>קורס עיקרי</span>
                  </div>
                  <p className="text-foreground font-medium">{student.course}</p>
                </div>
                <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">תאריך הצטרפות</p>
                  <p className="text-foreground font-medium text-lg">{student.joinDate}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4 mt-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">קורסים רשומים</h4>
                {getStudentCourses().length > 0 ? (
                  getStudentCourses().map((course: any) => (
                    <Card key={course.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-semibold text-foreground">{course.name}</h5>
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {course.level}
                            </span>
                            <span>{course.duration}</span>
                            <span>{course.weekdays?.join(", ")}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-semibold text-primary">{course.price} ₪</span>
                          <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-400 mb-0.5">יתרת מפגשים</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                              {student?.courseSessions?.[course.id] || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">התלמיד אינו רשום לאף קורס כרגע</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700 dark:text-green-400">שולם</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">2,400 ₪</p>
                </Card>
                <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-orange-600" />
                    <p className="text-xs text-orange-700 dark:text-orange-400">ממתין</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">1,200 ₪</p>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700 dark:text-blue-400">סה"כ</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">3,600 ₪</p>
                </Card>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">היסטוריית תשלומים</h4>
                {getStudentPayments().map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{payment.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">שיטת תשלום: {payment.method}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{payment.amount} ₪</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === "שולם"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                              : "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700 dark:text-green-400">נוכחות</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">80%</p>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700 dark:text-blue-400">שיעורים</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">4/5</p>
                </Card>
                <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="h-4 w-4 text-orange-600" />
                    <p className="text-xs text-orange-700 dark:text-orange-400">שעות</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">8</p>
                </Card>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">רשומות נוכחות</h4>
                {getStudentAttendance().map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{record.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.course}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{record.hours} שעות</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            record.status === "נוכח"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
