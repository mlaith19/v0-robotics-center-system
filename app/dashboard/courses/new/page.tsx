"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Calendar, DollarSign, X, BookOpen, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewCoursePage() {
  const router = useRouter()

  const [schools, setSchools] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-schools")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [gafanPrograms, setGafanPrograms] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-gafan-programs")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [teachers, setTeachers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-teachers")
      if (saved) {
        const parsedTeachers = JSON.parse(saved)
        return parsedTeachers
      }
    }
    return []
  })

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: "",
    level: "מתחילים",
    status: "פעיל",
    location: "במרכז",
    schoolId: "",
    courseType: "רגיל",
    gafanProgramId: "",
    courseNumber: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    price: "",
    weekdays: [] as string[],
    teachers: [] as number[],
  })

  useEffect(() => {
    if (newCourse.gafanProgramId && newCourse.courseType === "תוכנית גפ״ן") {
      const selectedProgram = gafanPrograms.find((p: any) => p.id.toString() === newCourse.gafanProgramId)

      if (selectedProgram) {
        const updates = {
          name: selectedProgram.programName || selectedProgram.name || "",
          description: selectedProgram.details || selectedProgram.programDetails || selectedProgram.description || "",
          price: selectedProgram.pricing || selectedProgram.price || "",
          duration: selectedProgram.duration || "",
        }

        setNewCourse((prev) => ({
          ...prev,
          ...updates,
        }))
      }
    }
  }, [newCourse.gafanProgramId, newCourse.courseType, gafanPrograms])

  const weekdaysOptions = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

  const toggleWeekday = (day: string) => {
    setNewCourse((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day) ? prev.weekdays.filter((d) => d !== day) : [...prev.weekdays, day],
    }))
  }

  const toggleTeacher = (teacherId: number) => {
    setNewCourse((prev) => ({
      ...prev,
      teachers: prev.teachers.includes(teacherId)
        ? prev.teachers.filter((id) => id !== teacherId)
        : [...prev.teachers, teacherId],
    }))
  }

  const handleSubmit = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-courses")
      const courses = saved ? JSON.parse(saved) : []
      const course = {
        id: courses.length + 1,
        ...newCourse,
        students: 0,
      }
      localStorage.setItem("robotics-courses", JSON.stringify([...courses, course]))
      router.push("/dashboard/courses")
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">קורס חדש</h1>
          <p className="text-muted-foreground mt-1">הוסף קורס חדש למערכת הרובוטיקה</p>
        </div>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-500 text-white p-3 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">סטטוס הקורס</h3>
            <p className="text-sm text-muted-foreground">בחר את סטטוס הקורס והגדרות בסיסיות</p>
          </div>
        </div>

        <div className="flex gap-1 items-end flex-wrap">
          <div className="grid gap-2 min-w-[120px] max-w-[140px]">
            <Label className="text-sm font-medium">סטטוס</Label>
            <Select value={newCourse.status} onValueChange={(value) => setNewCourse({ ...newCourse, status: value })}>
              <SelectTrigger className="bg-white h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="פעיל">פעיל</SelectItem>
                <SelectItem value="בקרוב">בקרוב</SelectItem>
                <SelectItem value="הושהה">הושהה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 min-w-[120px] max-w-[140px]">
            <Label className="text-sm font-medium">סוג קורס</Label>
            <Select
              value={newCourse.courseType}
              onValueChange={(value) =>
                setNewCourse({
                  ...newCourse,
                  courseType: value,
                  gafanProgramId: value === "רגיל" ? "" : newCourse.gafanProgramId,
                })
              }
            >
              <SelectTrigger className="bg-white h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="רגיל">קורס רגיל</SelectItem>
                <SelectItem value="תוכנית גפ״ן">לפי תוכנית גפ״ן</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 min-w-[120px] max-w-[140px]">
            <Label className="text-sm font-medium">מיקום</Label>
            <Select
              value={newCourse.location}
              onValueChange={(value) =>
                setNewCourse({ ...newCourse, location: value, schoolId: value === "במרכז" ? "" : newCourse.schoolId })
              }
            >
              <SelectTrigger className="bg-white h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="במרכז">במרכז</SelectItem>
                <SelectItem value="בבית ספר">בבית ספר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newCourse.location === "בבית ספר" && (
            <div className="grid gap-2 min-w-[160px] max-w-[180px]">
              <Label className="text-sm font-medium">בית ספר</Label>
              <Select
                value={newCourse.schoolId}
                onValueChange={(value) => setNewCourse({ ...newCourse, schoolId: value })}
              >
                <SelectTrigger className="bg-white h-9 text-sm">
                  <SelectValue placeholder="בחר בית ספר" />
                </SelectTrigger>
                <SelectContent>
                  {schools.length > 0 ? (
                    schools.map((school: any) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      אין בתי ספר במערכת
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {newCourse.courseType === "תוכנית גפ״ן" && (
            <div className="grid gap-2 min-w-[160px] max-w-[180px]">
              <Label className="text-sm font-medium">תוכנית גפ״ן</Label>
              <Select
                value={newCourse.gafanProgramId}
                onValueChange={(value) => {
                  setNewCourse({ ...newCourse, gafanProgramId: value })
                }}
              >
                <SelectTrigger className="bg-white h-9 text-sm">
                  <SelectValue placeholder="בחר תוכנית" />
                </SelectTrigger>
                <SelectContent>
                  {gafanPrograms.length > 0 ? (
                    gafanPrograms.map((program: any) => {
                      const programName = program.programName || program.name || `תוכנית ${program.id}`
                      return (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {programName}
                        </SelectItem>
                      )
                    })
                  ) : (
                    <SelectItem value="none" disabled>
                      אין תוכניות גפ״ן במערכת
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {newCourse.courseType === "תוכנית גפ״ן" && newCourse.gafanProgramId && (
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800 font-medium">פרטי הקורס ימולאו אוטומטית מתוכנית הגפ״ן שנבחרה</p>
          </div>
        )}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="courseNumber" className="text-base font-medium">
                מס׳ קורס
              </Label>
              <Input
                id="courseNumber"
                value={newCourse.courseNumber}
                onChange={(e) => setNewCourse({ ...newCourse, courseNumber: e.target.value })}
                placeholder="לדוגמה: ROB-001"
                className="text-base h-12 bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-base font-medium">
                קטגוריה
              </Label>
              <Input
                id="category"
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                placeholder="לדוגמה: רובוטיקה"
                className="text-base h-12 bg-white"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-base font-medium">
              שם הקורס *
            </Label>
            <Input
              id="name"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              placeholder="לדוגמה: רובוטיקה מתקדמת"
              className="text-base h-12 bg-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-base font-medium">
              תיאור *
            </Label>
            <Textarea
              id="description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              placeholder="תאר את תוכן הקורס, היעדים והנושאים שילמדו..."
              rows={4}
              className="text-base resize-none bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="level" className="text-base font-medium">
                רמה
              </Label>
              <Select value={newCourse.level} onValueChange={(value) => setNewCourse({ ...newCourse, level: value })}>
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
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                placeholder="לדוגמה: 8 שבועות"
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
                {teachers.map((teacher: any) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Checkbox
                      id={`teacher-${teacher.id}`}
                      checked={newCourse.teachers.includes(teacher.id)}
                      onCheckedChange={() => toggleTeacher(teacher.id)}
                      className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <Label
                      htmlFor={`teacher-${teacher.id}`}
                      className="text-sm font-medium cursor-pointer select-none flex-1"
                    >
                      {teacher.name}
                    </Label>
                  </div>
                ))}
              </div>
              {newCourse.teachers.length > 0 && (
                <div className="pt-4 border-t-2 border-purple-100">
                  <p className="text-sm font-medium text-muted-foreground mb-3">מורים נבחרים:</p>
                  <div className="flex flex-wrap gap-2">
                    {newCourse.teachers.map((teacherId) => {
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
            <p className="text-sm text-muted-foreground text-center py-4">
              לא נמצאו מורים במערכת. אנא הוסף מורים תחילה.
            </p>
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
            <p className="text-sm text-muted-foreground">הגדר את לוח הזמנים של הקורס</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate" className="text-base font-medium">
                תאריך התחלה *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={newCourse.startDate}
                onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate" className="text-base font-medium">
                תאריך סיום *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newCourse.endDate}
                onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime" className="text-base font-medium">
                שעה התחלה *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={newCourse.startTime}
                onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime" className="text-base font-medium">
                שעה סיום *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={newCourse.endTime}
                onChange={(e) => setNewCourse({ ...newCourse, endTime: e.target.value })}
                className="text-base h-12 bg-white"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label className="text-base font-medium">ימי שבוע *</Label>
            <div className="grid grid-cols-4 gap-3">
              {weekdaysOptions.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-50 transition-colors bg-white"
                >
                  <Checkbox
                    id={`day-${day}`}
                    checked={newCourse.weekdays.includes(day)}
                    onCheckedChange={() => toggleWeekday(day)}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <Label htmlFor={`day-${day}`} className="text-sm font-medium cursor-pointer select-none">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            {newCourse.weekdays.length > 0 && (
              <div className="text-sm font-medium text-orange-700 bg-orange-100 px-4 py-3 rounded-lg border-2 border-orange-200">
                נבחרו: {newCourse.weekdays.join(", ")}
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
            <p className="text-sm text-muted-foreground">הגדר את מחיר הקורס</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price" className="text-base font-medium">
            מחיר הקורס (₪) *
          </Label>
          <Input
            id="price"
            type="number"
            value={newCourse.price}
            onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
            placeholder="לדוגמה: 2500"
            className="text-base h-12 bg-white"
            min="0"
          />
        </div>
      </Card>

      <div className="flex gap-3 justify-start">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="h-12 px-8 text-base"
          disabled={!newCourse.name || !newCourse.description}
        >
          הוסף קורס חדש
        </Button>
        <Link href="/dashboard/courses">
          <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent">
            ביטול
          </Button>
        </Link>
      </div>
    </div>
  )
}
