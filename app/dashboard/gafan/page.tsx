"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Mail, Phone, LayoutGrid, List, MapPin, Eye, Edit, Users, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { hasPermission } from "@/lib/permissions"

interface GafanProgram {
  id: number
  name: string
  institutionCode: string
  city: string
  address: string
  schoolPhone: string
  phone: string
  email: string
  contactPerson: string
  type: string
  status: string
  startDate: string
  bankName?: string
  bankCode?: string
  bankBranch?: string
  bankAccount?: string
  notes?: string
  coursesCount?: number
  studentsCount?: number
}

export default function GafanProgramsPage() {
  const [programs, setPrograms] = useState<GafanProgram[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-gafan-programs")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      {
        id: 1,
        name: 'תוכנית גפ"ן - רובוטיקה מתקדמת',
        institutionCode: "567890",
        city: "תל אביב",
        address: "רחוב ויצמן 30",
        schoolPhone: "03-6667777",
        phone: "050-9876543",
        email: "gafan-robotics@example.com",
        contactPerson: "מיכל אברהם",
        type: 'תוכנית גפ"ן',
        status: "פעיל",
        startDate: "01/09/2023",
        notes: "תוכנית מיוחדת לחינוך מדעי וטכנולוגי",
        coursesCount: 4,
        studentsCount: 60,
      },
    ]
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("robotics-gafan-programs", JSON.stringify(programs))
    }
  }, [programs])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    setCanDelete(hasPermission("gafan-delete"))
  }, [])

  const handleDelete = (programId: number, programName: string) => {
    const updatedPrograms = programs.filter((p) => p.id !== programId)
    setPrograms(updatedPrograms)
    if (typeof window !== "undefined") {
      localStorage.setItem("robotics-gafan-programs", JSON.stringify(updatedPrograms))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">תוכניות גפ"ן</h1>
          <p className="text-muted-foreground mt-2">נהל את כל תוכניות גפ"ן המשתפות פעולה</p>
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
            <Link href="/dashboard/gafan/new">
              <Plus className="h-4 w-4" />
              תוכנית גפ"ן חדשה
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">{program.name}</h3>
                    <p className="text-sm text-muted-foreground">{program.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap mr-2 ${
                      program.status === "פעיל"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : program.status === "מתעניין"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {program.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {program.city} - {program.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{program.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{program.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>איש קשר: {program.contactPerson}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">{program.coursesCount || 0}</div>
                      <div className="text-muted-foreground">קורסים</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">{program.studentsCount || 0}</div>
                      <div className="text-muted-foreground">תלמידים</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/gafan/${program.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      צפה
                    </Button>
                  </Link>
                  <Link href={`/dashboard/gafan/${program.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      ערוך
                    </Button>
                  </Link>
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                          <AlertDialogDescription>
                            פעולה זו תמחק לצמיתות את תוכנית גפ"ן <strong>{program.name}</strong>.
                            <br />
                            לא ניתן לשחזר את המידע לאחר המחיקה.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(program.id, program.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            מחק
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
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
                    שם התוכנית
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    קוד מוסד
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    עיר
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
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{program.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{program.institutionCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{program.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{program.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{program.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-center font-semibold text-primary">{program.coursesCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-center font-semibold text-primary">{program.studentsCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          program.status === "פעיל"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : program.status === "מתעניין"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/gafan/${program.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            צפה
                          </Button>
                        </Link>
                        <Link href={`/dashboard/gafan/${program.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            ערוך
                          </Button>
                        </Link>
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                מחק
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  פעולה זו תמחק לצמיתות את תוכנית גפ"ן <strong>{program.name}</strong>.
                                  <br />
                                  לא ניתן לשחזר את המידע לאחר המחיקה.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(program.id, program.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  מחק
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
