"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  idNumber?: string
  birthDate?: string
  city?: string
}

export default function EditTeacherPage() {
  const router = useRouter()
  const params = useParams()
  const [teacher, setTeacher] = useState<Teacher | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && params.id) {
      const saved = localStorage.getItem("robotics-teachers")
      if (saved) {
        const teachers: Teacher[] = JSON.parse(saved)
        const found = teachers.find((t) => t.id === Number(params.id))
        setTeacher(found || null)
      }
    }
  }, [params.id])

  const handleSave = () => {
    if (typeof window !== "undefined" && teacher) {
      const saved = localStorage.getItem("robotics-teachers")
      if (saved) {
        const teachers: Teacher[] = JSON.parse(saved)
        const updatedTeachers = teachers.map((t) => (t.id === teacher.id ? teacher : t))
        localStorage.setItem("robotics-teachers", JSON.stringify(updatedTeachers))
        router.push(`/dashboard/teachers/${teacher.id}`)
      }
    }
  }

  if (!teacher) {
    return <div>טוען...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">ערוך מורה</h1>
            <p className="text-muted-foreground mt-2">{teacher.name}</p>
          </div>
        </div>

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
            <Select value={teacher.status} onValueChange={(value) => setTeacher({ ...teacher, status: value })}>
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
                value={teacher.name}
                onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
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
                  value={(teacher as any).idNumber || ""}
                  onChange={(e) => setTeacher({ ...teacher, idNumber: e.target.value } as any)}
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
                  value={(teacher as any).birthDate || ""}
                  onChange={(e) => setTeacher({ ...teacher, birthDate: e.target.value } as any)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                עיר
              </Label>
              <CityCombobox
                value={(teacher as any).city || ""}
                onChange={(value) => setTeacher({ ...teacher, city: value } as any)}
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
                value={teacher.specialization}
                onChange={(e) => setTeacher({ ...teacher, specialization: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                אודות
              </Label>
              <Textarea
                id="bio"
                value={teacher.bio || ""}
                onChange={(e) => setTeacher({ ...teacher, bio: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

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
                value={teacher.email}
                onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                טלפון
              </Label>
              <Input
                id="phone"
                value={teacher.phone}
                onChange={(e) => setTeacher({ ...teacher, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

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
                value={teacher.centerHourlyRate}
                onChange={(e) => setTeacher({ ...teacher, centerHourlyRate: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="travelRate">נסיעות (₪)</Label>
              <Input
                id="travelRate"
                type="number"
                value={teacher.travelRate}
                onChange={(e) => setTeacher({ ...teacher, travelRate: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="externalCourseRate">מחיר שעה בקורס חיצוני (₪)</Label>
              <Input
                id="externalCourseRate"
                type="number"
                value={teacher.externalCourseRate}
                onChange={(e) => setTeacher({ ...teacher, externalCourseRate: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            ביטול
          </Button>
          <Button size="lg" onClick={handleSave}>
            שמור שינויים
          </Button>
        </div>
      </div>
    </div>
  )
}
