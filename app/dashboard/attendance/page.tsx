"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Check, X, Thermometer, Plane, ArrowRight, AlertCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import useSWR, { mutate } from "swr"

type AttendanceType = "course" | "teacher" | "student"
type AttendanceStatus = "present" | "absent" | "sick" | "vacation"

interface Student {
  id: string
  name: string
  phone: string
  courseSessions?: Record<string, number>
}

interface Teacher {
  id: string
  name: string
  phone: string
}

interface Course {
  id: string
  name: string
}

interface Enrollment {
  id: string
  studentId: string
  courseId: string
  studentName?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AttendancePage() {
  const router = useRouter()
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("course")
  const [selectedId, setSelectedId] = useState<string>("")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("") // For student type - which course
  const [participantType, setParticipantType] = useState<"student" | "teacher">("student") // For course type - show students or teachers
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({})
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({})
  const [deletingStatus, setDeletingStatus] = useState<Record<string, boolean>>({})

  // Fetch data from API
  const { data: students = [] } = useSWR<Student[]>("/api/students", fetcher)
  const { data: teachers = [] } = useSWR<Teacher[]>("/api/teachers", fetcher)
  const { data: courses = [] } = useSWR<Course[]>("/api/courses", fetcher)

  // Fetch attendance history for selected course (all dates)
  const { data: attendanceHistory = [] } = useSWR<any[]>(
    selectedId && attendanceType === "course" ? `/api/attendance?courseId=${selectedId}` : null,
    fetcher
  )

  // Fetch enrollments for selected course
  const { data: enrollments = [] } = useSWR<Enrollment[]>(
    selectedId && attendanceType === "course" ? `/api/enrollments?courseId=${selectedId}` : null,
    fetcher
  )

  // Fetch attendance for selected date and course/student
  const dateStr = selectedDate && !isNaN(selectedDate.getTime()) 
    ? format(selectedDate, "yyyy-MM-dd") 
    : format(new Date(), "yyyy-MM-dd")
  const { data: existingAttendance = [] } = useSWR(
    selectedId && selectedDate
      ? `/api/attendance?${attendanceType === "course" ? `courseId=${selectedId}` : `studentId=${selectedId}`}&date=${dateStr}`
      : null,
    fetcher,
    {
      onSuccess: (data) => {
        // Convert array to record for easier lookup
        const attendanceRecord: Record<string, AttendanceStatus> = {}
        data.forEach((a: any) => {
          attendanceRecord[a.studentId] = a.status
        })
        setAttendanceData(attendanceRecord)
      },
    }
  )

  const getTableData = () => {
    if (attendanceType === "course") {
      if (participantType === "student") {
        // Get students enrolled in selected course
        const enrolledStudentIds = enrollments.map((e: Enrollment) => e.studentId)
        return students.filter((s: Student) => enrolledStudentIds.includes(s.id))
      } else {
        // Show all teachers (or filter by course assignment if available)
        return teachers
      }
    } else if (attendanceType === "teacher") {
      return teachers.filter((t: Teacher) => t.id === selectedId)
    } else {
      return students.filter((s: Student) => s.id === selectedId)
    }
  }

  const handleStatusChange = async (personId: string, status: AttendanceStatus, courseIdOverride?: string) => {
    const previousStatus = attendanceData[personId]
    
    // Determine the correct courseId based on attendance type
    // For "course" type: selectedId IS the course
    // For "student" type: we need selectedCourseId (separate selection)
    // For "teacher" type: we need selectedCourseId as well
    const courseId = courseIdOverride || (attendanceType === "course" ? selectedId : selectedCourseId)
    
    if (!courseId) {
      // No course selected - silently return (UI should prevent this)
      return
    }
    
    // Optimistic update
    setAttendanceData((prev) => ({
      ...prev,
      [personId]: status,
    }))
    setSavingStatus((prev) => ({ ...prev, [personId]: true }))

    try {
      // Build request body based on attendance type
      const requestBody: Record<string, string> = {
        courseId,
        date: dateStr,
        status,
      }
      
      // Determine if this is teacher or student attendance
      const isTeacherAttendance = attendanceType === "teacher" || (attendanceType === "course" && participantType === "teacher")
      
      if (isTeacherAttendance) {
        requestBody.teacherId = personId
      } else {
        requestBody.studentId = personId
      }
      
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save attendance")
      }

      // Revalidate attendance data
      mutate(`/api/attendance?courseId=${courseId}&date=${dateStr}`)
    } catch (error) {
      // Revert on error
      setAttendanceData((prev) => ({
        ...prev,
        [personId]: previousStatus,
      }))
      console.error("Failed to save attendance:", error)
    } finally {
      setSavingStatus((prev) => ({ ...prev, [personId]: false }))
    }
  }

  const handleDelete = async (personId: string) => {
    // Determine the correct courseId based on attendance type
    const courseId = attendanceType === "course" ? selectedId : selectedCourseId
    
    if (!courseId) return
    
    // Confirm deletion
    if (!confirm("האם אתה בטוח שברצונך למחוק את הנוכחות?")) return
    
    setDeletingStatus((prev) => ({ ...prev, [personId]: true }))
    
    try {
      const isTeacherAttendance = attendanceType === "teacher" || (attendanceType === "course" && participantType === "teacher")
      
      const params = new URLSearchParams({
        courseId,
        date: dateStr,
        ...(isTeacherAttendance ? { teacherId: personId } : { studentId: personId }),
      })
      
      const res = await fetch(`/api/attendance?${params}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete attendance")
      }

      // Remove from local state
      setAttendanceData((prev) => {
        const newData = { ...prev }
        delete newData[personId]
        return newData
      })

      // Revalidate attendance data
      mutate(`/api/attendance?courseId=${courseId}&date=${dateStr}`)
      mutate(`/api/attendance?courseId=${selectedId}`)
    } catch (error) {
      console.error("Failed to delete attendance:", error)
    } finally {
      setDeletingStatus((prev) => ({ ...prev, [personId]: false }))
    }
  }

  const getStatusButton = (personId: string, status: AttendanceStatus, label: string, icon: any) => {
    const Icon = icon
    const isActive = attendanceData[personId] === status
    const isSaving = savingStatus[personId]

    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => handleStatusChange(personId, status)}
        disabled={isSaving}
        className={`gap-1 ${
          isActive
            ? status === "present"
              ? "bg-green-600 hover:bg-green-700"
              : status === "absent"
                ? "bg-red-600 hover:bg-red-700"
                : status === "sick"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
            : "bg-transparent"
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
      ? courses.find((c: Course) => c.id === selectedId)
      : attendanceType === "teacher"
        ? teachers.find((t: Teacher) => t.id === selectedId)
        : students.find((s: Student) => s.id === selectedId)

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
        </div>

        {!hasData && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">אין נתונים זמינים</AlertTitle>
            <AlertDescription className="text-orange-800">
              לא נמצאו {attendanceType === "course" ? "קורסים" : attendanceType === "teacher" ? "מורים" : "תלמידים"}{" "}
              במערכת. הוסף נתונים דרך הדפים הרלוונטיים.
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
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">סוג</label>
                <Select
                  value={attendanceType}
                  onValueChange={(value: AttendanceType) => {
                    setAttendanceType(value)
                    setSelectedId("")
                    setSelectedCourseId("")
                    setAttendanceData({})
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
                <Select 
                  value={selectedId} 
                  onValueChange={(value) => {
                    setSelectedId(value)
                    setAttendanceData({})
                  }} 
                  disabled={!hasData}
                >
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
                      courses.map((course: Course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    {attendanceType === "teacher" &&
                      teachers.map((teacher: Teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    {attendanceType === "student" &&
                      students.map((student: Student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {attendanceType === "course" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">סוג משתתף</label>
                  <Select
                    value={participantType}
                    onValueChange={(value: "student" | "teacher") => {
                      setParticipantType(value)
                      setAttendanceData({})
                    }}
                    disabled={!selectedId}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="בחר סוג משתתף" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">תלמידים</SelectItem>
                      <SelectItem value="teacher">מורים</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(attendanceType === "student" || attendanceType === "teacher") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">קורס</label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={(value) => {
                      setSelectedCourseId(value)
                      setAttendanceData({})
                    }}
                    disabled={!courses.length || !selectedId}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={selectedId ? "בחר קורס" : `בחר ${attendanceType === "student" ? "תלמיד" : "מורה"} קודם`} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: Course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך</label>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value + "T12:00:00")
                    if (!isNaN(newDate.getTime())) {
                      setSelectedDate(newDate)
                      setAttendanceData({})
                    }
                  }}
                  disabled={!hasData}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedId && tableData.length > 0 && (attendanceType === "course" || selectedCourseId) && (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-lg">
                {attendanceType === "course"
                  ? `נוכחות קורס: ${selectedItem?.name}`
                  : attendanceType === "teacher"
                    ? `נוכחות מורה: ${(selectedItem as Teacher)?.name}`
                    : `נוכחות תלמיד: ${(selectedItem as Student)?.name}`}
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
                      <TableHead className="text-right font-semibold">תאריך</TableHead>
                      <TableHead className="text-right font-semibold">סטטוס נוכחות</TableHead>
                      <TableHead className="text-right font-semibold w-16">מחיקה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((person: any) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">
                          {person.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{person.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(selectedDate, "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {getStatusButton(person.id, "present", "נוכח", Check)}
                            {getStatusButton(person.id, "absent", "לא נוכח", X)}
                            {getStatusButton(person.id, "sick", "חולה", Thermometer)}
                            {getStatusButton(person.id, "vacation", "חופש", Plane)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(person.id)}
                            disabled={deletingStatus[person.id] || !attendanceData[person.id]}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

        {/* Attendance History Table */}
        {selectedId && attendanceType === "course" && attendanceHistory.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg">היסטוריית נוכחות - {selectedItem?.name}</CardTitle>
              <CardDescription>כל הנוכחויות שנרשמו לקורס זה</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-right font-semibold">תאריך</TableHead>
                      <TableHead className="text-right font-semibold">סוג</TableHead>
                      <TableHead className="text-right font-semibold">שם</TableHead>
                      <TableHead className="text-right font-semibold">סטטוס</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory
                      .filter((record: any) => {
                        // Filter by participant type
                        if (participantType === "teacher") {
                          return !!record.teacherId
                        } else {
                          return !!record.studentId
                        }
                      })
                      .map((record: any) => {
                      const isTeacher = !!record.teacherId
                      const student = record.studentId ? students.find((s) => s.id === record.studentId) : null
                      const teacher = record.teacherId ? teachers.find((t) => t.id === record.teacherId) : null
                      const personName = isTeacher ? (teacher?.name || "לא ידוע") : (student?.name || "לא ידוע")
                      
                      const statusLabels: Record<string, { label: string; color: string }> = {
                        present: { label: "נוכח", color: "bg-green-100 text-green-700" },
                        absent: { label: "לא נוכח", color: "bg-red-100 text-red-700" },
                        sick: { label: "חולה", color: "bg-yellow-100 text-yellow-700" },
                        vacation: { label: "חופש", color: "bg-blue-100 text-blue-700" },
                      }
                      const statusInfo = statusLabels[record.status] || { label: record.status, color: "bg-gray-100" }
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.date ? format(new Date(record.date), "dd/MM/yyyy") : "-"}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isTeacher ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                              {isTeacher ? "מורה" : "תלמיד"}
                            </span>
                          </TableCell>
                          <TableCell>{personName}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
