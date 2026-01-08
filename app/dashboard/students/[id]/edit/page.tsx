"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CityCombobox } from "@/components/ui/combobox-city"
import { ArrowRight, User, Award as IdCard, Phone, Users, Heart, BookOpen, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [student, setStudent] = useState({
    name: "",
    idNumber: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    father: "",
    mother: "",
    additionalPhone: "",
    healthFund: "",
    allergies: "",
    courseIds: [] as string[],
    status: "פעיל",
    totalSessions: 12,
    courseSessions: {} as Record<string, number>,
  })

  useEffect(() => {
    const savedCourses = localStorage.getItem("robotics-courses")
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    }

    const students = JSON.parse(localStorage.getItem("robotics-students") || "[]")
    const foundStudent = students.find((s: any) => s.id === Number.parseInt(params.id))
    if (foundStudent) {
      setStudent({
        name: foundStudent.name || "",
        idNumber: foundStudent.idNumber || "",
        birthDate: foundStudent.birthDate || "",
        email: foundStudent.email || "",
        phone: foundStudent.phone || "",
        address: foundStudent.address || "",
        city: foundStudent.city || "",
        father: foundStudent.father || "",
        mother: foundStudent.mother || "",
        additionalPhone: foundStudent.additionalPhone || "",
        healthFund: foundStudent.healthFund || "",
        allergies: foundStudent.allergies || "",
        courseIds: foundStudent.courseIds || [],
        status: foundStudent.status || "פעיל",
        totalSessions: foundStudent.totalSessions || 12,
        courseSessions: foundStudent.courseSessions || {},
      })
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const students = JSON.parse(localStorage.getItem("robotics-students") || "[]")
    const updatedStudents = students.map((s: any) =>
      s.id === Number.parseInt(params.id) ? { ...s, ...student, id: Number.parseInt(params.id) } : s,
    )

    localStorage.setItem("robotics-students", JSON.stringify(updatedStudents))
    router.push(`/dashboard/students/${params.id}`)
  }

  const toggleCourse = (courseId: string) => {
    setStudent((prev) => {
      const updatedCourseIds = prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId]

      const updatedCourseSessions = { ...prev.courseSessions }
      if (!prev.courseIds.includes(courseId)) {
        updatedCourseSessions[courseId] = prev.totalSessions
      }

      return {
        ...prev,
        courseIds: updatedCourseIds,
        courseSessions: updatedCourseSessions,
      }
    })
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/students/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">ערוך תלמיד</h1>
          <p className="text-muted-foreground mt-1">עדכן את פרטי התלמיד במערכת</p>
        </div>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-lg">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">סטטוס התלמיד</h3>
            <p className="text-sm text-muted-foreground mb-3">בחר את סטטוס התלמיד הנוכחי</p>
            <Select value={student.status} onValueChange={(value) => setStudent({ ...student, status: value })}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="מתעניין">מתעניין</SelectItem>
                <SelectItem value="פעיל">פעיל</SelectItem>
                <SelectItem value="השהיה">השהיה</SelectItem>
                <SelectItem value="סיים">סיים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500 text-white p-2.5 rounded-lg">
              <IdCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">מידע אישי</h3>
              <p className="text-sm text-muted-foreground">פרטים בסיסיים על התלמיד</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-base font-medium">
                שם מלא *
              </Label>
              <Input
                id="name"
                value={student.name}
                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                placeholder="לדוגמה: יוסי כהן"
                className="text-base h-12 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="idNumber" className="text-base font-medium">
                  תעודת זהות
                </Label>
                <Input
                  id="idNumber"
                  value={student.idNumber}
                  onChange={(e) => setStudent({ ...student, idNumber: e.target.value })}
                  placeholder="123456789"
                  className="text-base h-12 bg-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate" className="text-base font-medium">
                  תאריך לידה
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={student.birthDate}
                  onChange={(e) => setStudent({ ...student, birthDate: e.target.value })}
                  className="text-base h-12 bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 text-white p-2.5 rounded-lg">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">פרטי קשר</h3>
              <p className="text-sm text-muted-foreground">מידע ליצירת קשר</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-base font-medium">
                אימייל *
              </Label>
              <Input
                id="email"
                type="email"
                value={student.email}
                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                placeholder="student@example.com"
                className="text-base h-12 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-base font-medium">
                  מספר נייד
                </Label>
                <Input
                  id="phone"
                  value={student.phone}
                  onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                  placeholder="050-1234567"
                  className="text-base h-12 bg-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="additionalPhone" className="text-base font-medium">
                  מספר נייד נוסף
                </Label>
                <Input
                  id="additionalPhone"
                  value={student.additionalPhone}
                  onChange={(e) => setStudent({ ...student, additionalPhone: e.target.value })}
                  placeholder="052-9876543"
                  className="text-base h-12 bg-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city" className="text-base font-medium">
                עיר
              </Label>
              <CityCombobox
                value={student.city}
                onChange={(value) => setStudent({ ...student, city: value })}
                placeholder="בחר עיר"
                className="bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="text-base font-medium">
                כתובת
              </Label>
              <Input
                id="address"
                value={student.address}
                onChange={(e) => setStudent({ ...student, address: e.target.value })}
                placeholder="רחוב 123"
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500 text-white p-2.5 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">פרטי הורים</h3>
              <p className="text-sm text-muted-foreground">מידע על הורי התלמיד</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="father" className="text-base font-medium">
                שם האב
              </Label>
              <Input
                id="father"
                value={student.father}
                onChange={(e) => setStudent({ ...student, father: e.target.value })}
                placeholder="שם האב"
                className="text-base h-12 bg-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mother" className="text-base font-medium">
                שם האם
              </Label>
              <Input
                id="mother"
                value={student.mother}
                onChange={(e) => setStudent({ ...student, mother: e.target.value })}
                placeholder="שם האם"
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500 text-white p-2.5 rounded-lg">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">מידע רפואי</h3>
              <p className="text-sm text-muted-foreground">רגישויות וקופת חולים</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="healthFund" className="text-base font-medium">
                קופת חולים
              </Label>
              <Select
                value={student.healthFund}
                onValueChange={(value) => setStudent({ ...student, healthFund: value })}
              >
                <SelectTrigger id="healthFund" className="h-12 bg-white">
                  <SelectValue placeholder="בחר קופת חולים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="כללית">כללית</SelectItem>
                  <SelectItem value="מכבי">מכבי</SelectItem>
                  <SelectItem value="מאוחדת">מאוחדת</SelectItem>
                  <SelectItem value="לאומית">לאומית</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergies" className="text-base font-medium">
                רגישויות ואלרגיות
              </Label>
              <Textarea
                id="allergies"
                value={student.allergies}
                onChange={(e) => setStudent({ ...student, allergies: e.target.value })}
                placeholder="פרט כל רגישות או אלרגיה רלוונטית..."
                rows={4}
                className="text-base resize-none bg-white"
              />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 text-white p-2.5 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">קורסים</h3>
              <p className="text-sm text-muted-foreground">בחר קורסים עבור התלמיד</p>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="totalSessions" className="text-base font-medium">
              כמות מפגשים בררת מחדל
            </Label>
            <Input
              id="totalSessions"
              type="number"
              min="1"
              value={student.totalSessions}
              onChange={(e) => setStudent({ ...student, totalSessions: Number.parseInt(e.target.value) || 12 })}
              className="text-base h-12 bg-white mt-2"
            />
          </div>

          <div className="border-2 border-purple-200 rounded-lg p-5 bg-white">
            {courses.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={student.courseIds?.includes(course.id.toString()) || false}
                        onCheckedChange={() => toggleCourse(course.id.toString())}
                        className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <Label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium cursor-pointer select-none flex-1"
                      >
                        {course.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {student.courseIds.length > 0 && (
                  <div className="pt-4 border-t-2 border-purple-100">
                    <p className="text-sm font-medium text-muted-foreground mb-3">קורסים נבחרים:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.courseIds.map((courseId) => {
                        const course = courses.find((c: any) => c.id.toString() === courseId)
                        return course ? (
                          <span
                            key={courseId}
                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {course.name}
                            <button
                              type="button"
                              onClick={() => toggleCourse(courseId)}
                              className="hover:bg-purple-200 rounded-full p-1 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">אין קורסים זמינים במערכת</p>
            )}
          </div>
        </Card>

        <div className="flex gap-3 justify-start">
          <Button type="submit" size="lg" className="h-12 px-8 text-base" disabled={!student.name || !student.email}>
            שמור שינויים
          </Button>
          <Link href={`/dashboard/students/${params.id}`}>
            <Button type="button" variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent">
              ביטול
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
