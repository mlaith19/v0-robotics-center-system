"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Mail, Phone, LayoutGrid, List, MapPin, Eye, Edit, Users } from "lucide-react"

interface School {
  id: number
  name: string
  address: string
  phone: string
  email: string
  contactPerson: string
  type: string
  status: string
  joinDate: string
  notes?: string
  coursesCount?: number
  studentsCount?: number
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-schools")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: 1,
        name: "בית ספר אלון",
        address: "רחוב הרצל 45, תל אביב",
        phone: "03-5551234",
        email: "office@alon-school.co.il",
        contactPerson: "רונית כהן",
        type: "יסודי",
        status: "פעיל",
        joinDate: "01/09/2023",
        notes: "בית ספר יסודי עם דגש על מדע וטכנולוגיה",
        coursesCount: 3,
        studentsCount: 45,
      },
      {
        id: 2,
        name: "חטיבת ביניים הרצליה",
        address: "שדרות ירושלים 120, הרצליה",
        phone: "09-9552345",
        email: "info@herzliya-junior.co.il",
        contactPerson: "דוד לוי",
        type: "חטיבת ביניים",
        status: "פעיל",
        joinDate: "15/10/2023",
        notes: "חטיבת ביניים עם תוכנית מתקדמת ברובוטיקה",
        coursesCount: 2,
        studentsCount: 30,
      },
    ]
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("robotics-schools", JSON.stringify(schools))
    }
  }, [schools])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">בתי ספר</h1>
          <p className="text-muted-foreground mt-2">נהל את כל בתי הספר המשתפים פעולה</p>
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
            <Link href="/dashboard/schools/new">
              <Plus className="h-4 w-4" />
              בית ספר חדש
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Card key={school.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">{school.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap mr-2 ${
                      school.status === "פעיל"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : school.status === "מתעניין"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {school.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{school.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{school.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{school.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>איש קשר: {school.contactPerson}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">{school.coursesCount || 0}</div>
                      <div className="text-muted-foreground">קורסים</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">{school.studentsCount || 0}</div>
                      <div className="text-muted-foreground">תלמידים</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/schools/${school.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      צפה
                    </Button>
                  </Link>
                  <Link href={`/dashboard/schools/${school.id}/edit`} className="flex-1">
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
                    שם בית הספר
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    סוג
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    כתובת
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    איש קשר
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    טלפון
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    קורסים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    תלמידים
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
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{school.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{school.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">{school.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{school.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{school.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-center font-semibold text-primary">{school.coursesCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-center font-semibold text-primary">{school.studentsCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          school.status === "פעיל"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : school.status === "מתעניין"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/schools/${school.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            צפה
                          </Button>
                        </Link>
                        <Link href={`/dashboard/schools/${school.id}/edit`}>
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
