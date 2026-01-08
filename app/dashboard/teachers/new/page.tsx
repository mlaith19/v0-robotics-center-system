"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CityCombobox } from "@/components/ui/combobox-city"
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  Banknote,
  Calendar,
  Award as IdCard,
  MapPin,
} from "lucide-react"

const ISRAELI_CITIES = [
  "ירושלים",
  "תל אביב-יפו",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "אשדוד",
  "נתניה",
  "באר שבע",
  "בני ברק",
  "חולון",
  "רמת גן",
  "אשקלון",
  "רחובות",
  "בת ים",
  "בית שמש",
  "כפר סבא",
  "הרצליה",
  "חדרה",
  "מודיעין-מכבים-רעות",
  "נצרת",
  "לוד",
  "רעננה",
  "רמלה",
  "גבעתיים",
  "נהריה",
  "יבנה",
  "הוד השרון",
  "אור יהודה",
  "קריית גת",
  "עפולה",
  "קריית מוצקין",
  "נס ציונה",
  "אילת",
  "טבריה",
  "רהט",
  "רמת השרון",
  "כרמיאל",
  "אור עקיבא",
  "בית שאן",
  "מגדל העמק",
  "דימונה",
  "תמרה",
  "טירה",
  "שפרעם",
  "קלנסווה",
  "סחנין",
  "אום אל-פחם",
  "יפיע",
  "באקה אל-גרביה",
]

interface Teacher {
  id: number
  name: string
  idNumber?: string
  birthDate?: string
  city?: string
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

export default function NewTeacherPage() {
  console.log("[v0] NewTeacherPage component mounted")

  const router = useRouter()
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    idNumber: "",
    birthDate: "",
    city: "",
    email: "",
    phone: "",
    specialization: "",
    status: "פעיל",
    bio: "",
    centerHourlyRate: 50,
    travelRate: 30,
    externalCourseRate: 80,
  })

  const handleAddTeacher = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("robotics-teachers")
      const teachers: Teacher[] = saved ? JSON.parse(saved) : []

      const teacher: Teacher = {
        id: teachers.length > 0 ? Math.max(...teachers.map((t) => t.id)) + 1 : 1,
        ...newTeacher,
        joinDate: new Date().toLocaleDateString("he-IL"),
        courses: [],
      }

      teachers.push(teacher)
      localStorage.setItem("robotics-teachers", JSON.stringify(teachers))

      const registrations = JSON.parse(localStorage.getItem("robotics-registrations") || "[]")
      const registration = {
        id: `teacher-${teacher.id}-${Date.now()}`,
        name: newTeacher.name,
        type: "teacher" as const,
        phone: newTeacher.phone,
        email: newTeacher.email,
        status: "הושלם" as const,
        sentAt: new Date().toLocaleDateString("he-IL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      localStorage.setItem("robotics-registrations", JSON.stringify([...registrations, registration]))

      router.push("/dashboard/teachers")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">מורה חדש</h1>
            <p className="text-muted-foreground mt-2">הוסף מורה חדש למערכת הרובוטיקה</p>
          </div>
        </div>

        {/* Status card at the top with colorful design */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">סטטוס המורה</CardTitle>
                <CardDescription>בחר את סטטוס המורה הנוכחי</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={newTeacher.status}
              onValueChange={(value) => setNewTeacher({ ...newTeacher, status: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="פעיל">פעיל</SelectItem>
                <SelectItem value="חופשה">חופשה</SelectItem>
                <SelectItem value="לא פעיל">לא פעיל</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Colorful card with icon for personal info */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>מידע אישי</CardTitle>
                <CardDescription>פרטי זיהוי בסיסיים של המורה</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                שם מלא
              </Label>
              <Input
                id="name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                placeholder="לדוגמה: ד״ר משה לוי"
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="idNumber" className="flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  תעודת זהות
                </Label>
                <Input
                  id="idNumber"
                  value={newTeacher.idNumber}
                  onChange={(e) => setNewTeacher({ ...newTeacher, idNumber: e.target.value })}
                  placeholder="123456789"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  תאריך לידה
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newTeacher.birthDate}
                  onChange={(e) => setNewTeacher({ ...newTeacher, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                עיר
              </Label>
              <CityCombobox
                value={newTeacher.city}
                onChange={(value) => setNewTeacher({ ...newTeacher, city: value })}
                placeholder="בחר עיר"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialization" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                התמחות
              </Label>
              <Input
                id="specialization"
                value={newTeacher.specialization}
                onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
                placeholder="רובוטיקה, תכנות, אלקטרוניקה וכו׳"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                אודות
              </Label>
              <Textarea
                id="bio"
                value={newTeacher.bio}
                onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })}
                placeholder="מידע על המורה, ניסיון מקצועי וכו׳"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Colorful card with icon for contact info */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>פרטי קשר</CardTitle>
                <CardDescription>מידע ליצירת קשר עם המורה</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                placeholder="teacher@robotics.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                טלפון
              </Label>
              <Input
                id="phone"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                placeholder="050-1234567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Colorful card with icon for payment rates */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Banknote className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>תעריפים</CardTitle>
                <CardDescription>הגדרת מחירי השעה למורה</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="centerHourlyRate">מחיר שעה במרכז (₪)</Label>
              <Input
                id="centerHourlyRate"
                type="number"
                value={newTeacher.centerHourlyRate}
                onChange={(e) => setNewTeacher({ ...newTeacher, centerHourlyRate: Number(e.target.value) })}
                placeholder="50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="travelRate">נסיעות (₪)</Label>
              <Input
                id="travelRate"
                type="number"
                value={newTeacher.travelRate}
                onChange={(e) => setNewTeacher({ ...newTeacher, travelRate: Number(e.target.value) })}
                placeholder="30"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="externalCourseRate">מחיר שעה בקורס חיצוני (₪)</Label>
              <Input
                id="externalCourseRate"
                type="number"
                value={newTeacher.externalCourseRate}
                onChange={(e) => setNewTeacher({ ...newTeacher, externalCourseRate: Number(e.target.value) })}
                placeholder="80"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            ביטול
          </Button>
          <Button size="lg" onClick={handleAddTeacher} disabled={!newTeacher.name || !newTeacher.email}>
            הוסף מורה
          </Button>
        </div>
      </div>
    </div>
  )
}
