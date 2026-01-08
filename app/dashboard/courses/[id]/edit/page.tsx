"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, BookOpen, Users, Calendar, DollarSign, X } from "lucide-react"

export default function CourseEditPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)

  const [course, setCourse] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const weekdaysOptions = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCourses = localStorage.getItem("robotics-courses")
      const savedTeachers = localStorage.getItem("robotics-teachers")

      if (savedCourses) {
        const courses = JSON.parse(savedCourses)
        const foundCourse = courses.find((c: any) => c.id === courseId)
        setCourse(foundCourse)
      }

      if (savedTeachers) {
        setTeachers(JSON.parse(savedTeachers))
      }

      setLoading(false)
    }
  }, [courseId])

  const handleSave = () => {
    if (typeof window !== "undefined") {
      const savedCourses = localStorage.getItem("robotics-courses")
      if (savedCourses) {
        const courses = JSON.parse(savedCourses)
        const updatedCourses = courses.map((c: any) => (c.id === courseId ? course : c))
        localStorage.setItem("robotics-courses", JSON.stringify(updatedCourses))
        router.push(`/dashboard/courses/${courseId}`)
      }
    }
  }

  const toggleWeekday = (day: string) => {
    setCourse((prev: any) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day) ? prev.weekdays.filter((d: string) => d !== day) : [...prev.weekdays, day],
    }))
  }

  const toggleTeacher = (teacherId: number) => {
    setCourse((prev: any) => ({
      ...prev,
      teachers: prev.teachers.includes(teacherId)
        ? prev.teachers.filter((id: number) => id !== teacherId)
        : [...prev.teachers, teacherId],
    }))
  }

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">ערוך קורס</h1>
          <p className="text-muted-foreground mt-1">עדכן את פרטי הקורס במערכת</p>
        </div>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">סטטוס הקורס</h3>
            <p className="text-sm text-muted-foreground mb-3">עדכן את סטטוס הקורס</p>
            <Select value={course.status} onValueChange={(value) => setCourse({ ...course, status: value })}>
              <SelectTrigger className="w-full bg-white h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="פעיל">פעיל</SelectItem>
                <SelectItem value="בקרוב">בקרוב</SelectItem>
                <SelectItem value="הושהה">הושהה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-500 text-white p-2.5 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">מידע כללי</h3>
            <p className="text-sm text-muted-foreground">פרטי הקורס הבסיסיים</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-base font-medium">
              שם הקורס
            </Label>
            <Input
              id="name"
              value={course.name || ""}
              onChange={(e) => setCourse({ ...course, name: e.target.value })}
              placeholder="שם הקורס"
              className="text-base h-12 bg-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-base font-medium">
              תיאור
            </Label>
            <Textarea
              id="description"
              value={course.description || ""}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              placeholder="תאר את הקורס"
              rows={4}
              className="text-base bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="level" className="text-base font-medium">
                רמה
              </Label>
              <Select value={course.level} onValueChange={(value) => setCourse({ ...course, level: value })}>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מתחילים">מתחילים</SelectItem>
                  <SelectItem value="בינוני">בינוני</SelectItem>
                  <SelectItem value="מתקדמים">מתקדמים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration" className="text-base font-medium">
                משך הקורס
              </Label>
              <Input
                id="duration"
                value={course.duration || ""}
                onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                placeholder="למשל: 12 שבועות"
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-500 text-white p-2.5 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">מורים</h3>
            <p className="text-sm text-muted-foreground">בחר את המורים שילמדו בקורס</p>
          </div>
        </div>
        <div className="border-2 border-purple-200 rounded-lg p-5 bg-white">
          {teachers.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Checkbox
                      id={`teacher-${teacher.id}`}
                      checked={course.teachers?.includes(teacher.id)}
                      onCheckedChange={() => toggleTeacher(teacher.id)}
                      className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <Label htmlFor={`teacher-${teacher.id}`} className="text-sm font-medium cursor-pointer flex-1">
                      {teacher.name}
                    </Label>
                  </div>
                ))}
              </div>
              {course.teachers?.length > 0 && (
                <div className="pt-4 border-t-2 border-purple-100">
                  <p className="text-sm font-medium text-muted-foreground mb-3">מורים נבחרים:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.teachers.map((teacherId: number) => {
                      const teacher = teachers.find((t: any) => t.id === teacherId)
                      return teacher ? (
                        <span
                          key={teacherId}
                          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {teacher.name}
                          <button
                            type="button"
                            onClick={() => toggleTeacher(teacherId)}
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
            <p className="text-sm text-muted-foreground text-center py-4">אין מורים במערכת</p>
          )}
        </div>
      </Card>

      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-500 text-white p-2.5 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">תאריכים וזמנים</h3>
            <p className="text-sm text-muted-foreground">לוח הזמנים של הקורס</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate" className="text-base font-medium">
                תאריך התחלה
              </Label>
              <Input
                id="startDate"
                type="date"
                value={course.startDate || ""}
                onChange={(e) => setCourse({ ...course, startDate: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate" className="text-base font-medium">
                תאריך סיום
              </Label>
              <Input
                id="endDate"
                type="date"
                value={course.endDate || ""}
                onChange={(e) => setCourse({ ...course, endDate: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime" className="text-base font-medium">
                שעת התחלה
              </Label>
              <Input
                id="startTime"
                type="time"
                value={course.startTime || ""}
                onChange={(e) => setCourse({ ...course, startTime: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime" className="text-base font-medium">
                שעת סיום
              </Label>
              <Input
                id="endTime"
                type="time"
                value={course.endTime || ""}
                onChange={(e) => setCourse({ ...course, endTime: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label className="text-base font-medium">ימי שבוע</Label>
            <div className="grid grid-cols-4 gap-3">
              {weekdaysOptions.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-50 transition-colors bg-white"
                >
                  <Checkbox
                    id={`weekday-${day}`}
                    checked={course.weekdays?.includes(day)}
                    onCheckedChange={() => toggleWeekday(day)}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <Label htmlFor={`weekday-${day}`} className="text-sm font-medium cursor-pointer">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            {course.weekdays?.length > 0 && (
              <div className="text-sm font-medium text-orange-700 bg-orange-100 px-4 py-3 rounded-lg border-2 border-orange-200">
                נבחרו: {course.weekdays.join(", ")}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500 text-white p-2.5 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">תמחור</h3>
            <p className="text-sm text-muted-foreground">מחיר הקורס</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price" className="text-base font-medium">
            מחיר הקורס (₪)
          </Label>
          <Input
            id="price"
            type="number"
            value={course.price || ""}
            onChange={(e) => setCourse({ ...course, price: e.target.value })}
            placeholder="0"
            className="text-base h-12 bg-white"
            min="0"
          />
        </div>
      </Card>

      <div className="flex gap-3 justify-start">
        <Button onClick={handleSave} size="lg" className="h-12 px-8 text-base">
          שמור שינויים
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.back()} className="h-12 px-8 text-base">
          ביטול
        </Button>
      </div>
    </div>
  )
}
