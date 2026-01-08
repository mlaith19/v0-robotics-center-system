"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Check, X, Thermometer, Plane, ArrowRight, AlertCircle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type AttendanceType = "course" | "teacher" | "student"
type AttendanceStatus = "present" | "absent" | "sick" | "vacation"

interface Student {
  id: string
  firstName: string
  lastName: string
  phone: string
  courseSessions?: Record<string, number>
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  phone: string
}

interface Course {
  id: string
  name: string
  courseName?: string
}

export default function AttendancePage() {
  const router = useRouter()
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("course")
  const [selectedId, setSelectedId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({})

  const addSampleData = () => {
    const sampleCourse = {
      id: "demo-course-1",
      name: "רובוטיקה מתקדמת - דוגמה",
      courseName: "רובוטיקה מתקדמת - דוגמה",
      description: "קורס לדוגמה",
      status: "פעיל",
      type: "לפי תוכנית גפ״ן",
      location: "בית ספר הראלי",
      school: "חטיבת ביניים הראלי",
      price: 1200,
      duration: 8,
      level: "מתחילים",
    }

    const sampleStudents = [
      {
        id: "demo-student-1",
        firstName: "יוסי",
        lastName: "כהן",
        phone: "050-1234567",
        email: "yossi@example.com",
        idNumber: "123456789",
        gender: "male",
        birthDate: "2010-01-15",
        parentName: "דוד כהן",
        parentPhone: "050-1234567",
        courseSessions: { "demo-course-1": 2 },
      },
      {
        id: "demo-student-2",
        firstName: "שרה",
        lastName: "לוי",
        phone: "052-9876543",
        email: "sara@example.com",
        idNumber: "987654321",
        gender: "female",
        birthDate: "2011-05-20",
        parentName: "רחל לוי",
        parentPhone: "052-9876543",
        courseSessions: { "demo-course-1": 2 },
      },
      {
        id: "demo-student-3",
        firstName: "דניאל",
        lastName: "אברהם",
        phone: "054-5551234",
        email: "daniel@example.com",
        idNumber: "456789123",
        gender: "male",
        birthDate: "2010-09-10",
        parentName: "משה אברהם",
        parentPhone: "054-5551234",
        courseSessions: { "demo-course-1": 2 },
      },
    ]

    const sampleEnrollments = sampleStudents.map((student) => ({
      id: `enrollment-${student.id}`,
      studentId: student.id,
      courseId: sampleCourse.id,
      enrollmentDate: new Date().toISOString(),
    }))

    localStorage.setItem("robotics-courses", JSON.stringify([sampleCourse]))
    localStorage.setItem("robotics-students", JSON.stringify(sampleStudents))
    localStorage.setItem("robotics-enrollments", JSON.stringify(sampleEnrollments))

    setCourses([sampleCourse])
    setStudents(sampleStudents)

    alert("נוספו נתוני דוגמה! עכשיו תוכל לבחור את הקורס 'רובוטיקה מתקדמת - דוגמה' ולראות 3 תלמידים.")
  }

  useEffect(() => {
    const studentsData = JSON.parse(localStorage.getItem("robotics-students") || "[]")
    const teachersData = JSON.parse(localStorage.getItem("robotics-teachers") || "[]")
    const coursesData = JSON.parse(localStorage.getItem("robotics-courses") || "[]")

    setStudents(studentsData)
    setTeachers(teachersData)
    setCourses(coursesData)
  }, [])

  useEffect(() => {
    if (selectedId && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const storageKey = `attendance-${attendanceType}-${selectedId}-${dateStr}`
      const savedAttendance = JSON.parse(localStorage.getItem(storageKey) || "{}")
      setAttendanceData(savedAttendance)
    }
  }, [selectedId, selectedDate, attendanceType])

  const getTableData = () => {
    if (attendanceType === "course") {
      const course = courses.find((c) => c.id === selectedId)
      if (!course) return []

      const courseStudents = students.filter((s) => {
        const enrollments = JSON.parse(localStorage.getItem("robotics-enrollments") || "[]")
        return enrollments.some((e: any) => e.courseId === selectedId && e.studentId === s.id)
      })
      return courseStudents
    } else if (attendanceType === "teacher") {
      return teachers.filter((t) => t.id === selectedId)
    } else {
      return students.filter((s) => s.id === selectedId)
    }
  }

  const handleStatusChange = (personId: string, status: AttendanceStatus) => {
    const newAttendanceData = {
      ...attendanceData,
      [personId]: status,
    }
    setAttendanceData(newAttendanceData)

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const storageKey = `attendance-${attendanceType}-${selectedId}-${dateStr}`
    localStorage.setItem(storageKey, JSON.stringify(newAttendanceData))

    if (attendanceType === "course" && status === "present") {
      const studentsData = JSON.parse(localStorage.getItem("robotics-students") || "[]")
      const updatedStudents = studentsData.map((student: any) => {
        if (student.id === personId) {
          const courseSessions = student.courseSessions || {}
          const currentBalance = courseSessions[selectedId] || 0

          // Only deduct if there's balance and student wasn't already marked as present
          if (currentBalance > 0 && attendanceData[personId] !== "present") {
            courseSessions[selectedId] = currentBalance - 1
            return { ...student, courseSessions }
          }
        }
        return student
      })

      localStorage.setItem("robotics-students", JSON.stringify(updatedStudents))
      setStudents(updatedStudents)
    }
  }

  const getStatusButton = (personId: string, status: AttendanceStatus, label: string, icon: any) => {
    const Icon = icon
    const isActive = attendanceData[personId] === status

    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => handleStatusChange(personId, status)}
        className={`gap-1 ${
          isActive
            ? status === "present"
              ? "bg-green-600 hover:bg-green-700"
              : status === "absent"
                ? "bg-red-600 hover:bg-red-700"
                : status === "sick"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
            : ""
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    )
  }

  const tableData = getTableData()
  const selectedItem =
    attendanceType === "course"
      ? courses.find((c) => c.id === selectedId)
      : attendanceType === "teacher"
        ? teachers.find((t) => t.id === selectedId)
        : students.find((s) => s.id === selectedId)

  const getList = () => {
    if (attendanceType === "course") return courses
    if (attendanceType === "teacher") return teachers
    return students
  }

  const hasData = getList().length > 0

  return (
    <div className="flex min-h-screen w-full flex-col" dir="rtl">
      <div className="flex flex-col gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">נוכחות</h1>
              <p className="text-sm text-muted-foreground">ניהול נוכחות לקורסים, מורים ותלמידים</p>
            </div>
          </div>
          {!hasData && (
            <Button onClick={addSampleData} variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              הוסף נתוני דוגמה
            </Button>
          )}
        </div>

        {!hasData && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">אין נתונים זמינים</AlertTitle>
            <AlertDescription className="text-orange-800">
              לא נמצאו {attendanceType === "course" ? "קורסים" : attendanceType === "teacher" ? "מורים" : "תלמידים"}{" "}
              במערכת. לחץ על כפתור "הוסף נתוני דוגמה" כדי לראות הדגמה של דף הנוכחות.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              בחירת נוכחות
            </CardTitle>
            <CardDescription>בחר סוג, פריט ותאריך לניהול נוכחות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">סוג</label>
                <Select
                  value={attendanceType}
                  onValueChange={(value: AttendanceType) => {
                    setAttendanceType(value)
                    setSelectedId("")
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="בחר סוג" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">קורס</SelectItem>
                    <SelectItem value="teacher">מורה</SelectItem>
                    <SelectItem value="student">תלמיד</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {attendanceType === "course" ? "קורס" : attendanceType === "teacher" ? "מורה" : "תלמיד"}
                </label>
                <Select value={selectedId} onValueChange={setSelectedId} disabled={!hasData}>
                  <SelectTrigger className="h-10">
                    <SelectValue
                      placeholder={
                        hasData
                          ? `בחר ${attendanceType === "course" ? "קורס" : attendanceType === "teacher" ? "מורה" : "תלמיד"}`
                          : "אין נתונים"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceType === "course" &&
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name || course.courseName}
                        </SelectItem>
                      ))}
                    {attendanceType === "teacher" &&
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    {attendanceType === "student" &&
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך</label>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))}
                  disabled={!hasData}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedId && tableData.length > 0 && (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-lg">
                {attendanceType === "course"
                  ? `נוכחות קורס: ${selectedItem?.name || (selectedItem as Course)?.courseName}`
                  : attendanceType === "teacher"
                    ? `נוכחות מורה: ${(selectedItem as Teacher)?.firstName} ${(selectedItem as Teacher)?.lastName}`
                    : `נוכחות תלמיד: ${(selectedItem as Student)?.firstName} ${(selectedItem as Student)?.lastName}`}
              </CardTitle>
              <CardDescription>{format(selectedDate, "dd MMMM yyyy", { locale: he })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-right font-semibold">שם</TableHead>
                      <TableHead className="text-right font-semibold">טלפון</TableHead>
                      <TableHead className="text-right font-semibold">סטטוס נוכחות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((person: any) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">
                          {person.firstName || person.name} {person.lastName || ""}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{person.phone}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {getStatusButton(person.id, "present", "נוכח", Check)}
                            {getStatusButton(person.id, "absent", "לא נוכח", X)}
                            {getStatusButton(person.id, "sick", "חולה", Thermometer)}
                            {getStatusButton(person.id, "vacation", "חופש", Plane)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedId && tableData.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground">
                {attendanceType === "course" ? "אין תלמידים רשומים לקורס זה" : "לא נמצאו נתונים"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
