"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, LayoutGrid, List, Eye, Pencil, Trash2, Phone, Mail, MapPin, User, GraduationCap } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface Student {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  status?: string | null
  city?: string | null
  schoolId?: string | null
  parentName?: string | null
  parentPhone?: string | null
  createdAt?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusLabels: Record<string, string> = {
  "מתעניין": "מתעניין",
  "רשום": "רשום",
  "פעיל": "פעיל",
  "לא פעיל": "לא פעיל",
  "הפסיק": "הפסיק",
}

const statusColors: Record<string, string> = {
  "מתעניין": "bg-yellow-100 text-yellow-800",
  "רשום": "bg-blue-100 text-blue-800",
  "פעיל": "bg-green-100 text-green-800",
  "לא פעיל": "bg-gray-100 text-gray-800",
  "הפסיק": "bg-red-100 text-red-800",
}

const Loading = () => null

export default function StudentsPage() {
  const searchParams = useSearchParams()
  const { data: students = [], mutate } = useSWR<Student[]>("/api/students", fetcher)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.includes(searchTerm) ||
    student.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await fetch(`/api/students/${deleteId}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Failed to delete student:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">תלמידים</h1>
            <p className="text-muted-foreground mt-1">נהל את כל התלמידים במרכז</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button asChild>
              <Link href="/dashboard/students/new">
                <Plus className="h-4 w-4 ml-2" />
                תלמיד חדש
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש תלמידים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Students Grid/List */}
        {filteredStudents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              {searchTerm ? "לא נמצאו תלמידים התואמים לחיפוש" : "אין תלמידים רשומים עדיין"}
            </div>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link href="/dashboard/students/new">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף תלמיד ראשון
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-4"
          }>
            {filteredStudents.map((student) => (
              <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header with name and status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          {student.city && (
                            <p className="text-sm text-muted-foreground">{student.city}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={statusColors[student.status || "מתעניין"] || "bg-gray-100 text-gray-800"}>
                        {statusLabels[student.status || "מתעניין"] || student.status || "מתעניין"}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {student.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span dir="ltr">{student.phone}</span>
                        </div>
                      )}
                      {student.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{student.email}</span>
                        </div>
                      )}
                      {student.parentName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>הורה: {student.parentName}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={`/dashboard/students/${student.id}`}>
                          <Eye className="h-4 w-4 ml-1" />
                          צפה
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={`/dashboard/students/${student.id}/edit`}>
                          <Pencil className="h-4 w-4 ml-1" />
                          ערוך
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => setDeleteId(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תמחק את התלמיד לצמיתות. לא ניתן לבטל פעולה זו.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "מוחק..." : "מחק"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Suspense>
  )
}
