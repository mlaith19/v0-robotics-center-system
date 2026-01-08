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
import { ArrowRight, User, Award as IdCard, Phone, Users, Heart, BookOpen, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CityCombobox } from "@/components/ui/combobox-city"

type Course = { id: string | number; name: string }

export default function NewStudentPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [newStudent, setNewStudent] = useState({
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
    status: "מתעניין",
    totalSessions: 12,
    courseSessions: {} as Record<string, number>,
  })

  // זמנית: עדיין טוענים קורסים מ-localStorage (עד שנחבר Courses API)
  useEffect(() => {
    const savedCourses = localStorage.getItem("robotics-courses")
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    }
  }, [])

  const toggleCourse = (courseId: string) => {
    setNewStudent((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // בונים יתרת מפגשים לכל קורס
      const courseSessions: Record<string, number> = {}
      newStudent.courseIds.forEach((courseId) => {
        courseSessions[courseId] = newStudent.totalSessions
      })

      const payload = {
        ...newStudent,
        // שמירה ל-DB: נרצה null במקום מחרוזות ריקות
        idNumber: newStudent.idNumber || null,
        birthDate: newStudent.birthDate || null,
        email: newStudent.email || null,
        phone: newStudent.phone || null,
        address: newStudent.address || null,
        city: newStudent.city || null,
        father: newStudent.father || null,
        mother: newStudent.mother || null,
        additionalPhone: newStudent.additionalPhone || null,
        healthFund: newStudent.healthFund || null,
        allergies: newStudent.allergies || null,
        courseSessions,
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || `Failed to create student (${res.status})`)
      }

      // (אופציונלי) להשאיר את registrations בלוקאל - או להסיר לגמרי
      const registrations = JSON.parse(localStorage.getItem("robotics-registrations") || "[]")
      const registration = {
        id: `student-${Date.now()}`,
        name: newStudent.name,
        type: "student" as const,
        phone: newStudent.phone,
        email: newStudent.email,
        status: "הושלם" as const,
        sentAt: new Date().toLocaleDateString("he-IL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      localStorage.setItem("robotics-registrations", JSON.stringify([...registrations, registration]))

      router.push("/dashboard/students")
      router.refresh()
    } catch (err: any) {
      setSubmitError(err?.message ?? "שגיאה בהוספת תלמיד")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">תלמיד חדש</h1>
          <p className="text-muted-foreground mt-1">הוסף תלמיד חדש למערכת הרובוטיקה</p>
        </div>
      </div>

      {submitError && (
        <Card className="border-2 border-red-200 bg-red-50 p-4">
          <div className="font-medium text-red-700">שגיאה</div>
          <div className="text-sm text-red-700/80 mt-1">{submitError}</div>
        </Card>
      )}

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-lg">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">סטטוס התלמיד</h3>
            <p className="text-sm text-muted-foreground mb-3">בחר את סטטוס התלמיד הנוכחי</p>
            <Select value={newStudent.status} onValueChange={(value) => setNewStudent({ ...newStudent, status: value })}>
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
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
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
                  value={newStudent.idNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, idNumber: e.target.value })}
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
                  value={newStudent.birthDate}
                  onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
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
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
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
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
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
                  value={newStudent.additionalPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, additionalPhone: e.target.value })}
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
                value={newStudent.city}
                onChange={(value) => setNewStudent({ ...newStudent, city: value })}
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
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
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
                value={newStudent.father}
                onChange={(e) => setNewStudent({ ...newStudent, father: e.target.value })}
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
                value={newStudent.mother}
                onChange={(e) => setNewStudent({ ...newStudent, mother: e.target.value })}
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
                value={newStudent.healthFund}
                onValueChange={(value) => setNewStudent({ ...newStudent, healthFund: value })}
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
                value={newStudent.allergies}
                onChange={(e) => setNewStudent({ ...newStudent, allergies: e.target.value })}
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
              כמות מפגשים
            </Label>
            <Input
              id="totalSessions"
              type="number"
              min="1"
              value={newStudent.totalSessions}
              onChange={(e) => setNewStudent({ ...newStudent, totalSessions: Number.parseInt(e.target.value) || 12 })}
              className="text-base h-12 bg-white mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">כמות המפגשים שתוקצה לכל קורס (ברירת מחדל: 12)</p>
          </div>

          <div className="border-2 border-purple-200 rounded-lg p-5 bg-white">
            {courses.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {courses.map((course) => (
                    <div
                      key={course.id.toString()}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={newStudent.courseIds.includes(course.id.toString())}
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

                {newStudent.courseIds.length > 0 && (
                  <div className="pt-4 border-t-2 border-purple-100">
                    <p className="text-sm font-medium text-muted-foreground mb-3">קורסים נבחרים:</p>
                    <div className="flex flex-wrap gap-2">
                      {newStudent.courseIds.map((courseId) => {
                        const course = courses.find((c) => c.id.toString() === courseId)
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
          <Button
            type="submit"
            size="lg"
            className="h-12 px-8 text-base"
            disabled={isSubmitting || !newStudent.name || !newStudent.email}
          >
            {isSubmitting ? "שומר..." : "הוסף תלמיד"}
          </Button>

          <Link href="/dashboard/students">
            <Button type="button" variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent">
              ביטול
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
