"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Users,
  DollarSign,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"

export default function CourseViewPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)

  const [course, setCourse] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCourses = localStorage.getItem("robotics-courses")
      const savedTeachers = localStorage.getItem("robotics-teachers")
      const savedStudents = localStorage.getItem("robotics-students")

      if (savedCourses) {
        const courses = JSON.parse(savedCourses)
        const foundCourse = courses.find((c: any) => c.id === courseId)
        setCourse(foundCourse)
      }

      if (savedTeachers) {
        setTeachers(JSON.parse(savedTeachers))
      }

      if (savedStudents) {
        setStudents(JSON.parse(savedStudents))
      }
    }
  }, [courseId])

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    )
  }

  const getTeacherNames = (teacherIds: number[] = []) => {
    return teachers
      .filter((t) => teacherIds.includes(t.id))
      .map((t) => t.name)
      .join(", ")
  }

  const enrolledStudents = students.filter((student: any) => student.courses?.includes(courseId))

  const paymentStats = {
    totalRevenue: Number.parseFloat(course.price) * enrolledStudents.length,
    paidStudents: enrolledStudents.filter((s: any) => s.paymentStatus === "שולם" || s.paymentStatus === "paid").length,
    unpaidAmount: enrolledStudents
      .filter((s: any) => s.paymentStatus !== "שולם" && s.paymentStatus !== "paid")
      .reduce((sum: number, s: any) => sum + (Number.parseFloat(s.balance) || 0), 0),
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">פרטי קורס</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Link href="/dashboard/courses" className="hover:text-foreground transition-colors">
                  קורסים
                </Link>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-foreground font-medium">{course.name}</span>
              </div>
            </div>
          </div>
          <Link href={`/dashboard/courses/${courseId}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              ערוך קורס
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="general" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">כללי</TabsTrigger>
              <TabsTrigger value="students">ילדים משויכים</TabsTrigger>
              <TabsTrigger value="payments">עלות ותשלומים</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    פרטי הקורס
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">רמה:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">משך:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">סטטוס:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === "פעיל"
                            ? "bg-green-100 text-green-700"
                            : course.status === "בקרוב"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">מחיר:</span>
                      <span className="font-bold text-primary text-xl">₪{course.price}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    תאריכים ושעות
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">תאריך התחלה:</span>
                      <span className="font-medium">{course.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">תאריך סיום:</span>
                      <span className="font-medium">{course.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">שעות התחלה:</span>
                      <span className="font-medium">{course.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">שעות סיום:</span>
                      <span className="font-medium">{course.endTime}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">ימי שבוע:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {course.weekdays?.map((day: string) => (
                          <span key={day} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    מורים
                  </h3>
                  <div className="space-y-2">
                    {course.teachers && course.teachers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {teachers
                          .filter((t) => course.teachers.includes(t.id))
                          .map((teacher) => (
                            <div key={teacher.id} className="px-3 py-2 bg-muted rounded-lg">
                              <p className="font-medium">{teacher.name}</p>
                              <p className="text-sm text-muted-foreground">{teacher.specialty}</p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">לא משוייך מורה</p>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    סטטיסטיקות
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">סה"כ תלמידים:</span>
                      <span className="font-bold text-2xl text-primary">{enrolledStudents.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">תלמידים רשומים ({enrolledStudents.length})</h3>
                {enrolledStudents.length > 0 ? (
                  <div className="space-y-3">
                    {enrolledStudents.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">גיל: {student.age}</p>
                          <p className="text-sm text-muted-foreground">טלפון: {student.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">אין תלמידים רשומים לקורס זה</p>
                )}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4 mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">הכנסות צפויות</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">₪{paymentStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {enrolledStudents.length} תלמידים × ₪{course.price}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">שילמו</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{paymentStats.paidStudents}</p>
                  <p className="text-sm text-muted-foreground mt-1">מתוך {enrolledStudents.length} תלמידים</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">יתרה לגביה</h3>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">₪{paymentStats.unpaidAmount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {enrolledStudents.length - paymentStats.paidStudents} תלמידים
                  </p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">פירוט תשלומים לפי תלמיד</h3>
                {enrolledStudents.length > 0 ? (
                  <div className="space-y-3">
                    {enrolledStudents.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {student.paymentStatus === "שולם" || student.paymentStatus === "paid" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">₪{course.price}</p>
                          <p
                            className={`text-sm ${
                              student.paymentStatus === "שולם" || student.paymentStatus === "paid"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {student.paymentStatus === "שולם" || student.paymentStatus === "paid" ? "שולם" : "לא שולם"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">אין נתוני תשלומים</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
