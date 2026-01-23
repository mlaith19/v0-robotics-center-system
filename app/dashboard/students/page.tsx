"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
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
import { Plus, Search, List, LayoutGrid, Eye, Pencil, Trash2, Phone, Mail, User, MapPin, Users, Loader2 } from "lucide-react"

interface Student {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  status?: string | null
  city?: string | null
  father?: string | null
  mother?: string | null
  additionalPhone?: string | null
  healthFund?: string | null
  createdAt?: string
}

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

export default function StudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students")
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!studentToDelete) return

    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setStudents(students.filter(s => s.id !== studentToDelete.id))
      }
    } catch (error) {
      console.error("Error deleting student:", error)
    } finally {
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.includes(searchTerm) ||
    student.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">תלמידים</h1>
          <p className="text-muted-foreground mt-1">נהל את כל התלמידים במרכז</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/dashboard/students/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              תלמיד חדש
            </Button>
          </Link>
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

      {/* Students Grid/List */}
      {filteredStudents.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">אין תלמידים</h3>
          <p className="text-muted-foreground mb-4">לא נמצאו תלמידים התואמים את החיפוש</p>
          <Link href="/dashboard/students/new">
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              הוסף תלמיד חדש
            </Button>
          </Link>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredStudents.map((student) => (
            <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Header with Avatar and Status - RTL */}
                <div className="flex items-start justify-between mb-4 flex-row-reverse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-right">
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
                <div className="space-y-2 mb-4 text-sm">
                  {student.phone && (
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      <span dir="ltr">{student.phone}</span>
                      <Phone className="h-4 w-4" />
                    </div>
                  )}
                  {student.email && (
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      <span>{student.email}</span>
                      <Mail className="h-4 w-4" />
                    </div>
                  )}
                  {student.father && (
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      <span>אב: {student.father}</span>
                      <Users className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 bg-transparent"
                    onClick={() => {
                      setStudentToDelete(student)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link href={`/dashboard/students/${student.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
                      <Pencil className="h-4 w-4" />
                      ערוך
                    </Button>
                  </Link>
                  <Link href={`/dashboard/students/${student.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
                      <Eye className="h-4 w-4" />
                      צפה
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את התלמיד "{studentToDelete?.name}" לצמיתות. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
