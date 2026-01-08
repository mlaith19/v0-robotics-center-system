"use client"

import { useState, useEffect } from "react"
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
import { Send, UserPlus, GraduationCap, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type RegistrationType = "student" | "teacher"

interface Registration {
  id: string
  name: string
  type: RegistrationType
  phone: string
  email: string
  status: "ממתין" | "הושלם"
  sentAt: string
}

export default function RegistrationPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadRegistrations = () => {
      const stored = localStorage.getItem("robotics-registrations")
      if (stored) {
        setRegistrations(JSON.parse(stored))
      }
    }

    loadRegistrations()

    // רענון הרשימה כל 3 שניות כדי להציג רישומים חדשים
    const interval = setInterval(loadRegistrations, 3000)
    return () => clearInterval(interval)
  }, [])

  const sendRegistrationForm = (type: RegistrationType) => {
    // קריאת הגדרות המרכז
    const settings = localStorage.getItem("robotics-center-settings")

    let whatsappNumber = ""

    if (settings) {
      const parsed = JSON.parse(settings)
      whatsappNumber = parsed.whatsapp || ""
    }

    if (!whatsappNumber) {
      toast({
        title: "שגיאה",
        description: "לא הוגדר מספר WhatsApp בהגדרות המערכת",
        variant: "destructive",
      })
      return
    }

    // יצירת קישור לטופס
    const formUrl = `${window.location.origin}/dashboard/${type === "student" ? "students" : "teachers"}/new`

    // הסרת תווים מיוחדים ממספר הטלפון
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "")

    // הודעה לשליחה
    const message =
      type === "student"
        ? `שלום, נשלח אליך טופס רישום לתלמיד חדש במרכז הרובוטיקה. אנא מלא את הפרטים בקישור הבא: ${formUrl}`
        : `שלום, נשלח אליך טופס רישום למורה חדש במרכז הרובוטיקה. אנא מלא את הפרטים בקישור הבא: ${formUrl}`

    // פתיחת WhatsApp עם ההודעה
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank")

    setDialogOpen(false)

    toast({
      title: "נשלח בהצלחה",
      description: `טופס רישום ל${type === "student" ? "תלמיד" : "מורה"} נשלח ב-WhatsApp`,
    })
  }

  const handleViewDetails = (registration: Registration) => {
    if (registration.type === "student") {
      router.push(`/dashboard/students/${registration.id}`)
    } else {
      router.push(`/dashboard/teachers/${registration.id}`)
    }
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
                <TableHead className="text-right">נשלח בתאריך</TableHead>
                <TableHead className="text-right">כפתורים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    לא נשלחו טפסי רישום עדיין
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={registration.id}>
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
                    <TableCell>{registration.phone}</TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          registration.status === "הושלם"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {registration.status}
                      </span>
                    </TableCell>
                    <TableCell>{registration.sentAt}</TableCell>
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
