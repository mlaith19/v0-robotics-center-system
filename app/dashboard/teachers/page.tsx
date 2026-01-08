"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Mail, Phone, LayoutGrid, List, BookOpen, Eye, Edit } from "lucide-react"

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
  description: string
  weekdays: string[]
  startTime: string
  endTime: string
  status: string
  teachers: number[]
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-teachers")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: 1,
        name: "ד״ר משה לוי",
        email: "moshe@robotics.com",
        phone: "050-1111111",
        specialization: "רובוטיקה מתקדמת",
        status: "פעיל",
        joinDate: "01/01/2023",
        bio: "מומחה ברובוטיקה עם 15 שנות ניסיון",
        courses: ["מבוא לרובוטיקה", "Arduino למתקדמים"],
        centerHourlyRate: 50,
        travelRate: 30,
        externalCourseRate: 80,
      },
      {
        id: 2,
        name: "שרה כהן",
        email: "sara@robotics.com",
        phone: "052-2222222",
        specialization: "תכנות Python",
        status: "פעיל",
        joinDate: "15/03/2023",
        bio: "מהנדסת תוכנה ומרצה",
        courses: ["תכנות Python למתקדמים"],
        centerHourlyRate: 50,
        travelRate: 30,
        externalCourseRate: 80,
      },
      {
        id: 3,
        name: "יוסי אברהם",
        email: "yossi@robotics.com",
        phone: "054-3333333",
        specialization: "אלקטרוניקה",
        status: "פעיל",
        joinDate: "10/06/2023",
        bio: "מומחה באלקטרוניקה ומיקרו-בקרים",
        courses: ["Arduino למתחילים"],
        centerHourlyRate: 50,
        travelRate: 30,
        externalCourseRate: 80,
      },
    ]
  })

  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-courses")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("robotics-teachers", JSON.stringify(teachers))
    }
  }, [teachers])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">מורים</h1>
          <p className="text-muted-foreground mt-2">נהל את כל המורים במרכז</p>
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
          <Button asChild className="gap-2">
            <Link href="/dashboard/teachers/new">
              <Plus className="h-4 w-4" />
              מורה חדש
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.specialization}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap mr-2 ${
                      teacher.status === "פעיל"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {teacher.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </div>
                  {teacher.courses && teacher.courses.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{teacher.courses.length} קורסים</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>במרכז:</span>
                      <span className="font-semibold">₪{teacher.centerHourlyRate}/שעה</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>נסיעות:</span>
                      <span className="font-semibold">₪{teacher.travelRate}/שעה</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>קורס חיצוני:</span>
                      <span className="font-semibold">₪{teacher.externalCourseRate}/שעה</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/teachers/${teacher.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      צפה
                    </Button>
                  </Link>
                  <Link href={`/dashboard/teachers/${teacher.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      ערוך
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    שם המורה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    התמחות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    אימייל
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    טלפון
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    קורסים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    מחיר שעה במרכז
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
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{teacher.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{teacher.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{teacher.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {teacher.courses && teacher.courses.length > 0 ? `${teacher.courses.length} קורסים` : "אין"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary">₪{teacher.centerHourlyRate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          teacher.status === "פעיל"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/teachers/${teacher.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            צפה
                          </Button>
                        </Link>
                        <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            ערוך
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
