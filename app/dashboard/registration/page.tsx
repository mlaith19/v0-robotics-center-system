"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Send, UserPlus, GraduationCap, MoreHorizontal, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type RegistrationType = "student" | "teacher"

interface Student {
  id: string
  name: string
  phone: string
  email: string
  createdAt: string
}

interface Teacher {
  id: string
  name: string
  phone: string
  email: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function RegistrationPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [centerSettings, setCenterSettings] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch students and teachers from API
  const { data: students = [], isLoading: studentsLoading } = useSWR<Student[]>("/api/students", fetcher)
  const { data: teachers = [], isLoading: teachersLoading } = useSWR<Teacher[]>("/api/teachers", fetcher)

  useEffect(() => {
    // Load center settings from API
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          setCenterSettings(data)
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      }
    }
    fetchSettings()
  }, [])

  // Combine students and teachers into registrations list
  const registrations = [
    ...students.map((s) => ({
      id: s.id,
      name: s.name || "",
      type: "student" as RegistrationType,
      phone: s.phone || "",
      email: s.email || "",
      status: "הושלם" as const,
      createdAt: s.createdAt,
    })),
    ...teachers.map((t) => ({
      id: t.id,
      name: t.name || "",
      type: "teacher" as RegistrationType,
      phone: t.phone || "",
      email: t.email || "",
      status: "הושלם" as const,
      createdAt: t.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const sendRegistrationForm = (type: RegistrationType) => {
    let whatsappNumber = centerSettings?.whatsapp || ""

    if (!whatsappNumber) {
      toast({
        title: "שגיאה",
        description: "לא הוגדר מספר WhatsApp בהגדרות המערכת",
        variant: "destructive",
      })
      return
    }

    // Create form link
    const formUrl = `${window.location.origin}/dashboard/${type === "student" ? "students" : "teachers"}/new`

    // Clean phone number
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "")

    // Message to send
    const message =
      type === "student"
        ? `שלום, נשלח אליך טופס רישום לתלמיד חדש במרכז הרובוטיקה. אנא מלא את הפרטים בקישור הבא: ${formUrl}`
        : `שלום, נשלח אליך טופס רישום למורה חדש במרכז הרובוטיקה. אנא מלא את הפרטים בקישור הבא: ${formUrl}`

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    setDialogOpen(false)

    toast({
      title: "נשלח בהצלחה",
      description: `טופס רישום ל${type === "student" ? "תלמיד" : "מורה"} נשלח ב-WhatsApp`,
    })
  }

  const handleViewDetails = (registration: { id: string; type: RegistrationType }) => {
    if (registration.type === "student") {
      router.push(`/dashboard/students/${registration.id}`)
    } else {
      router.push(`/dashboard/teachers/${registration.id}`)
    }
  }

  if (studentsLoading || teachersLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-2 text-muted-foreground hover:text-foreground"
          onClick={() => window.history.back()}
        >
          ← חזרה
        </Button>
        <h1 className="text-3xl font-bold">רישום</h1>
        <p className="text-muted-foreground mt-2">שלח טפסי רישום לתלמידים ומורים חדשים דרך WhatsApp</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                טפסי רישום
              </CardTitle>
              <CardDescription>נהל ושלח טפסי רישום לתלמידים ומורים חדשים</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  שליחת טופס רישום
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>שליחת טופס רישום</DialogTitle>
                  <DialogDescription>בחר את סוג הרישום שברצונך לשלוח</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant="outline"
                    className="h-20 gap-3 text-lg bg-transparent"
                    onClick={() => sendRegistrationForm("student")}
                  >
                    <UserPlus className="h-6 w-6" />
                    טופס רישום לתלמיד
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 gap-3 text-lg bg-transparent"
                    onClick={() => sendRegistrationForm("teacher")}
                  >
                    <GraduationCap className="h-6 w-6" />
                    טופס רישום למורה
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">סוג</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">אימייל</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">תאריך רישום</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    לא נרשמו תלמידים או מורים עדיין
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={`${registration.type}-${registration.id}`}>
                    <TableCell className="font-medium">{registration.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          registration.type === "student"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {registration.type === "student" ? "תלמיד" : "מורה"}
                      </span>
                    </TableCell>
                    <TableCell>{registration.phone || "-"}</TableCell>
                    <TableCell>{registration.email || "-"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {registration.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {registration.createdAt
                        ? new Date(registration.createdAt).toLocaleDateString("he-IL")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(registration)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
