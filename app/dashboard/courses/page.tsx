"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Plus,
  BookOpen,
  Users,
  Clock,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CoursesPage() {
  const [courses, setCourses] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-courses")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: 1,
        name: "מבוא לרובוטיקה",
        description: "קורס מקיף המכסה את היסודות של בניית וחידוד רובוטים",
        students: 24,
        duration: "12 שבועות",
        level: "מתחילים",
        status: "פעיל",
        startDate: "2024-01-15",
        endDate: "2024-04-08",
        startTime: "16:00",
        endTime: "18:00",
        price: "2500",
        weekdays: ["ראשון", "שלישי"],
        teachers: [],
      },
      {
        id: 2,
        name: "תכנות Python למתקדמים",
        description: "למד תכנות מתקדם עם Python לבניית מערכות רובוטיות",
        students: 18,
        duration: "10 שבועות",
        level: "מתקדמים",
        status: "פעיל",
        startDate: "2024-02-01",
        endDate: "2024-04-15",
        startTime: "18:30",
        endTime: "20:30",
        price: "3200",
        weekdays: ["שני", "רביעי"],
        teachers: [],
      },
      {
        id: 3,
        name: "בינה מלאכותית ולמידת מכונה",
        description: "הבנת אלגוריתמי AI וליישומם ברובוטיקה",
        students: 15,
        duration: "14 שבועות",
        level: "מתקדמים",
        status: "בקרוב",
        startDate: "2024-03-01",
        endDate: "2024-06-10",
        startTime: "17:00",
        endTime: "19:30",
        price: "4500",
        weekdays: ["ראשון", "שני", "רביעי"],
        teachers: [],
      },
      {
        id: 4,
        name: "Arduino למתחילים",
        description: "בניית פרויקטים אלקטרוניים עם Arduino",
        students: 32,
        duration: "8 שבועות",
        level: "מתחילים",
        status: "פעיל",
        startDate: "2024-01-20",
        endDate: "2024-03-20",
        startTime: "15:00",
        endTime: "17:00",
        price: "1800",
        weekdays: ["שלישי", "חמישי"],
        teachers: [],
      },
    ]
  })

  const [teachers, setTeachers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-teachers")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return []
  })

  const [students, setStudents] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-students")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("robotics-courses", JSON.stringify(courses))
    }
  }, [courses])

  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: "",
    level: "מתחילים",
    status: "פעיל",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    price: "",
    weekdays: [] as string[],
    teachers: [] as number[],
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const weekdaysOptions = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

  const toggleWeekday = (day: string, isNew = true) => {
    if (isNew) {
      setNewCourse((prev) => ({
        ...prev,
        weekdays: prev.weekdays.includes(day) ? prev.weekdays.filter((d) => d !== day) : [...prev.weekdays, day],
      }))
    } else {
      setSelectedCourse((prev: any) => ({
        ...prev,
        weekdays: prev.weekdays.includes(day)
          ? prev.weekdays.filter((d: string) => d !== day)
          : [...prev.weekdays, day],
      }))
    }
  }

  const toggleTeacher = (teacherId: number, isNew = true) => {
    if (isNew) {
      setNewCourse((prev) => ({
        ...prev,
        teachers: prev.teachers.includes(teacherId)
          ? prev.teachers.filter((id) => id !== teacherId)
          : [...prev.teachers, teacherId],
      }))
    } else {
      setSelectedCourse((prev: any) => ({
        ...prev,
        teachers: prev.teachers.includes(teacherId)
          ? prev.teachers.filter((id: number) => id !== teacherId)
          : [...prev.teachers, teacherId],
      }))
    }
  }

  const handleAddCourse = () => {
    const course = {
      id: courses.length + 1,
      ...newCourse,
      students: 0, // Defaulting to 0 as per original structure
    }
    setCourses([...courses, course])
    setNewCourse({
      name: "",
      description: "",
      duration: "",
      level: "מתחילים",
      status: "פעיל",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      price: "",
      weekdays: [],
      teachers: [],
    })
    setOpen(false)
  }

  const handleEditCourse = () => {
    if (selectedCourse) {
      setCourses(courses.map((c) => (c.id === selectedCourse.id ? selectedCourse : c)))
      setEditOpen(false)
      setSelectedCourse(null)
    }
  }

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course)
    setViewOpen(true)
  }

  const handleOpenEdit = (course: any) => {
    setSelectedCourse({ ...course })
    setEditOpen(true)
  }

  const getTeacherNames = (teacherIds: number[] = []) => {
    return teacherIds
      .map((id) => teachers.find((t: any) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  const getPaymentStats = (courseId: number) => {
    const courseStudents = students.filter((student: any) => student.courses?.includes(courseId))

    const totalStudents = courseStudents.length
    const paidStudents = courseStudents.filter(
      (student: any) => student.paymentStatus === "שולם" || student.paymentStatus === "paid",
    ).length
    const unpaidAmount = courseStudents
      .filter((student: any) => student.paymentStatus !== "שולם" && student.paymentStatus !== "paid")
      .reduce((sum: number, student: any) => sum + (Number.parseFloat(student.balance) || 0), 0)

    return {
      totalStudents,
      paidStudents,
      unpaidAmount,
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">קורסים</h1>
          <p className="text-muted-foreground mt-2">נהל את כל הקורסים במרכז</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {/* CHANGE: Fixed Link wrapping Button by using asChild */}
          <Button asChild className="gap-2">
            <Link href="/dashboard/courses/new">
              <Plus className="h-4 w-4" />
              קורס חדש
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => {
            const stats = getPaymentStats(course.id)
            return (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-1">{course.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap mr-2 ${
                        course.status === "פעיל"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : course.status === "בקרוב"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{stats.totalStudents} תלמידים</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{course.weekdays?.join(", ")}</span>
                    </div>
                    {course.teachers && course.teachers.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span className="truncate">{getTeacherNames(course.teachers) || "לא משוייך"}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-green-700 dark:text-green-400 mb-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">שילמו</span>
                      </div>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        {stats.paidStudents}/{stats.totalStudents}
                      </p>
                    </div>
                    <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-700 dark:text-orange-400 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">יתרה</span>
                      </div>
                      <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                        ₪{stats.unpaidAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">מחיר:</span>
                      <span className="text-2xl font-bold text-primary">₪{course.price}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center justify-between">
                        <span>תאריכים:</span>
                        <span>
                          {course.startDate} - {course.endDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>שעות:</span>
                        <span>
                          {course.startTime} - {course.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        צפה
                      </Button>
                    </Link>
                    <Link href={`/dashboard/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                        <Edit className="h-4 w-4" />
                        ערוך
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {viewMode === "list" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    שם הקורס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    רמה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    משך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ימים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    מורים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    תלמידים ששילמו
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    יתרה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    מחיר
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {courses.map((course: any) => {
                  const stats = getPaymentStats(course.id)
                  return (
                    <tr key={course.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{course.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{course.level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{course.duration}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground">{course.weekdays?.join(", ")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground">
                          {getTeacherNames(course.teachers) || "לא משוייך"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            {stats.paidStudents}/{stats.totalStudents}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                            ₪{stats.unpaidAmount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">₪{course.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.status === "פעיל"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : course.status === "בקרוב"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/courses/${course.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              צפה
                            </Button>
                          </Link>
                          <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              ערוך
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCourse?.name}</DialogTitle>
            <DialogDescription>פרטי הקורס המלאים</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">כללי</TabsTrigger>
              <TabsTrigger value="students">ילדים משוייכים</TabsTrigger>
              <TabsTrigger value="payments">עלות ותשלומים</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground">תיאור הקורס</Label>
                  <p className="text-sm text-foreground p-3 bg-muted/50 rounded-lg leading-relaxed">
                    {selectedCourse?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-muted-foreground">רמה</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{selectedCourse?.level}</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-muted-foreground">סטטוס</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedCourse?.status === "פעיל"
                            ? "bg-accent/10 text-accent"
                            : selectedCourse?.status === "בקרוב"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {selectedCourse?.status}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCourse?.teachers && selectedCourse.teachers.length > 0 && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-muted-foreground">מורים</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                      {selectedCourse.teachers.map((teacherId: number) => {
                        const teacher = teachers.find((t: any) => t.id === teacherId)
                        return teacher ? (
                          <span key={teacherId} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            {teacher.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    תאריכים
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">תאריך התחלה</p>
                      <p className="text-sm font-medium">
                        {selectedCourse?.startDate && new Date(selectedCourse.startDate).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">תאריך סיום</p>
                      <p className="text-sm font-medium">
                        {selectedCourse?.endDate && new Date(selectedCourse.endDate).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    שעות
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">שעות התחלה</p>
                      <p className="text-sm font-medium">{selectedCourse?.startTime}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">שעות סיום</p>
                      <p className="text-sm font-medium">{selectedCourse?.endTime}</p>
                    </div>
                  </div>
                </div>

                {selectedCourse?.weekdays && selectedCourse.weekdays.length > 0 && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-muted-foreground">ימי שבוע</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                      {selectedCourse.weekdays.map((day: string) => (
                        <span key={day} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCourse?.duration && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-muted-foreground">משך הקורס</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{selectedCourse.duration}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    תלמידים רשומים ({selectedCourse?.students || 0})
                  </Label>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Plus className="h-3 w-3" />
                    הוסף תלמיד
                  </Button>
                </div>

                {(() => {
                  const allStudents =
                    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("robotics-students") || "[]") : []
                  const enrolledStudents = allStudents.filter((student: any) => student.course === selectedCourse?.name)

                  return enrolledStudents.length > 0 ? (
                    <div className="space-y-2">
                      {enrolledStudents.map((student: any) => (
                        <Card key={student.id} className="p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">{student.name}</h4>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                student.status === "פעיל"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {student.status}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">עדיין אין תלמידים רשומים לקורס זה</p>
                    </div>
                  )
                })()}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    מחיר הקורס
                  </Label>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
                    <div className="text-3xl font-bold text-primary">₪{selectedCourse?.price}</div>
                    <p className="text-xs text-muted-foreground mt-1">מחיר לתלמיד</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedCourse?.students || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">תלמידים</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent">
                      ₪
                      {(
                        (selectedCourse?.students || 0) * Number.parseInt(selectedCourse?.price || "0")
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">הכנסות צפויות</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ₪
                      {(
                        (selectedCourse?.students || 0) *
                        Number.parseInt(selectedCourse?.price || "0") *
                        0.8
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">שולם</p>
                  </Card>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground">סטטוס תשלומים</Label>
                  <div className="space-y-2">
                    {(() => {
                      const allStudents =
                        typeof window !== "undefined"
                          ? JSON.parse(localStorage.getItem("robotics-students") || "[]")
                          : []
                      const enrolledStudents = allStudents.filter(
                        (student: any) => student.course === selectedCourse?.name,
                      )

                      return enrolledStudents.length > 0 ? (
                        enrolledStudents.map((student: any, index: number) => {
                          const paid = Math.random() > 0.3
                          const amount = Number.parseInt(selectedCourse?.price || "0")
                          const paidAmount = paid ? amount : Math.floor(amount * Math.random())

                          return (
                            <Card key={student.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${paid ? "bg-green-500" : "bg-orange-500"}`} />
                                  <span className="text-sm font-medium">{student.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    ₪{paidAmount} / ₪{amount}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      paid ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                                    }`}
                                  >
                                    {paid ? "שולם" : "חלקי"}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          )
                        })
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">אין נתוני תשלומים</div>
                      )
                    })()}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground">יתרה לגביה</Label>
                  <Card className="p-4 bg-orange-500/5 border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">סך הכל חוב</span>
                      <span className="text-xl font-bold text-orange-600">
                        ₪
                        {(
                          (selectedCourse?.students || 0) *
                          Number.parseInt(selectedCourse?.price || "0") *
                          0.2
                        ).toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 justify-end border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              סגור
            </Button>
            <Button
              onClick={() => {
                setViewOpen(false)
                handleOpenEdit(selectedCourse)
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              ערוך קורס
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">ערוך קורס</DialogTitle>
            <DialogDescription>ערוך את פרטי הקורס</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="grid gap-6 py-4">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">מידע כללי</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">שם הקורס *</Label>
                    <Input
                      id="edit-name"
                      value={selectedCourse.name}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, name: e.target.value })}
                      className="text-base"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">תיאור *</Label>
                    <Textarea
                      id="edit-description"
                      value={selectedCourse.description}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>מורים *</Label>
                    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                      {teachers.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {teachers.map((teacher: any) => (
                            <div key={teacher.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`edit-teacher-${teacher.id}`}
                                checked={selectedCourse.teachers?.includes(teacher.id) || false}
                                onCheckedChange={() => toggleTeacher(teacher.id, false)}
                              />
                              <Label
                                htmlFor={`edit-teacher-${teacher.id}`}
                                className="text-sm font-normal cursor-pointer select-none flex-1"
                              >
                                {teacher.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">לא נמצאו מורים במערכת</p>
                      )}
                      {selectedCourse.teachers && selectedCourse.teachers.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">מורים נבחרים:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCourse.teachers.map((teacherId: number) => {
                              const teacher = teachers.find((t: any) => t.id === teacherId)
                              return teacher ? (
                                <span
                                  key={teacherId}
                                  className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center gap-1"
                                >
                                  {teacher.name}
                                  <button
                                    type="button"
                                    onClick={() => toggleTeacher(teacherId, false)}
                                    className="hover:bg-primary/20 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-level">רמה</Label>
                      <Select
                        value={selectedCourse.level}
                        onValueChange={(value) => setSelectedCourse({ ...selectedCourse, level: value })}
                      >
                        <SelectTrigger>
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
                      <Label htmlFor="edit-status">סטטוס</Label>
                      <Select
                        value={selectedCourse.status}
                        onValueChange={(value) => setSelectedCourse({ ...selectedCourse, status: value })}
                      >
                        <SelectTrigger>
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  תאריכים ושעות
                </h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-startDate">תאריך התחלה</Label>
                      <Input
                        id="edit-startDate"
                        type="date"
                        value={selectedCourse.startDate}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, startDate: e.target.value })}
                        className="text-base"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-endDate">תאריך סיום</Label>
                      <Input
                        id="edit-endDate"
                        type="date"
                        value={selectedCourse.endDate}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, endDate: e.target.value })}
                        className="text-base"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-startTime">שעות התחלה</Label>
                      <Input
                        id="edit-startTime"
                        type="time"
                        value={selectedCourse.startTime}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, startTime: e.target.value })}
                        className="text-base"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-endTime">שעות סיום</Label>
                      <Input
                        id="edit-endTime"
                        type="time"
                        value={selectedCourse.endTime}
                        onChange={(e) => setSelectedCourse({ ...selectedCourse, endTime: e.target.value })}
                        className="text-base"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label>ימי שבוע</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {weekdaysOptions.map((day) => (
                        <div key={day} className="flex items-center gap-2">
                          <Checkbox
                            id={`edit-day-${day}`}
                            checked={selectedCourse.weekdays?.includes(day) || false}
                            onCheckedChange={() => toggleWeekday(day, false)}
                          />
                          <Label htmlFor={`edit-day-${day}`} className="text-sm font-normal cursor-pointer select-none">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedCourse.weekdays && selectedCourse.weekdays.length > 0 && (
                      <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                        נבחרו: {selectedCourse.weekdays.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-duration">משך הקורס</Label>
                    <Input
                      id="edit-duration"
                      value={selectedCourse.duration}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, duration: e.target.value })}
                      className="text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  תמחור
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">מחיר הקורס (₪)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={selectedCourse.price}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, price: e.target.value })}
                    className="text-base"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleEditCourse} className="gap-2">
              <Edit className="h-4 w-4" />
              שמור שינויים
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
