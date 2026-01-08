"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Mail, Phone, LayoutGrid, List, BookOpen, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
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

type Student = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  status?: string | null
  createdAt?: string
  // שדות נוספים שיש לך ב-DB (לא חובה למסך הזה)
  // city?: string | null
  // address?: string | null
}

function formatDate(dateString?: string) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("he-IL").format(d)
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/students", { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load students (${res.status})`)

        const data = (await res.json()) as Student[]
        if (!cancelled) setStudents(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "שגיאה בטעינת תלמידים")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setCanDelete(hasPermission("students-delete"))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete student")

      // Remove from local state
      setStudents((prev) => prev.filter((s) => s.id !== id))
    } catch (e: any) {
      alert(e?.message ?? "שגיאה במחיקת תלמיד")
    } finally {
      setDeletingId(null)
    }
  }

  const hasStudents = useMemo(() => students.length > 0, [students.length])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">תלמידים</h1>
          <p className="text-muted-foreground mt-2">נהל את כל התלמידים במרכז</p>
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
            <Link href="/dashboard/students/new">
              <Plus className="h-4 w-4" />
              תלמיד חדש
            </Link>
          </Button>
        </div>
      </div>

      {loading && <div className="border rounded-lg p-6 text-muted-foreground">טוען תלמידים...</div>}

      {!loading && error && (
        <div className="border rounded-lg p-6">
          <div className="font-medium text-red-600">שגיאה</div>
          <div className="text-sm text-muted-foreground mt-1">{error}</div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
              נסה שוב
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && !hasStudents && (
        <div className="border rounded-lg p-10 text-center">
          <div className="text-lg font-semibold">אין תלמידים עדיין</div>
          <div className="text-muted-foreground mt-2">לחץ על "תלמיד חדש" כדי להוסיף תלמיד</div>
          <div className="mt-6">
            <Button asChild className="gap-2">
              <Link href="/dashboard/students/new">
                <Plus className="h-4 w-4" />
                תלמיד חדש
              </Link>
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && hasStudents && viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">—</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap mr-2 ${
                      (student.status ?? "מתעניין") === "פעיל"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {student.status ?? "מתעניין"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{student.email ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>הצטרף: {formatDate(student.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/students/${student.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      צפה
                    </Button>
                  </Link>
                  <Link href={`/dashboard/students/${student.id}/edit`} className="flex-1">
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
                          disabled={deletingId === student.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                          <AlertDialogDescription>
                            פעולה זו תמחק את התלמיד <strong>{student.name}</strong> לצמיתות. לא ניתן יהיה לשחזר את
                            הנתונים.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(student.id)}
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

      {!loading && !error && hasStudents && viewMode === "list" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    שם התלמיד
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    אימייל
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    טלפון
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    תאריך הצטרפות
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
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{student.email ?? "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{student.phone ?? "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (student.status ?? "מתעניין") === "פעיל"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {student.status ?? "מתעניין"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/students/${student.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            צפה
                          </Button>
                        </Link>
                        <Link href={`/dashboard/students/${student.id}/edit`}>
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
                                disabled={deletingId === student.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                מחק
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  פעולה זו תמחק את התלמיד <strong>{student.name}</strong> לצמיתות. לא ניתן יהיה לשחזר את
                                  הנתונים.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(student.id)}
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
