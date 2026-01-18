"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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

type TeacherApi = {
  id: string
  name: string
  email?: string | null
  phone?: string | null

  status?: string | null
  idNumber?: string | null
  birthDate?: string | null // יכול להגיע ISO
  city?: string | null
  specialties?: string | null
  notes?: string | null
  rateCenter?: number | null
  rateTravel?: number | null
  rateExternal?: number | null
}

function toDateInputValue(value: any): string {
  if (!value) return ""
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    // YYYY-MM-DD
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  } catch {
    return ""
  }
}

export default function EditTeacherPage() {
  const router = useRouter()
  const params = useParams()
  const teacherId = useMemo(() => String((params as any)?.id || ""), [params])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ שמרנו את אותם שדות/עיצוב כמו "מורה חדש"
  const [form, setForm] = useState({
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

  // ✅ טעינת מורה לפי ID
  useEffect(() => {
    if (!teacherId) return

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/teachers/${teacherId}`, { cache: "no-store" })
        const data = (await res.json().catch(() => null)) as TeacherApi | null

        if (!res.ok || !data) {
          throw new Error((data as any)?.error || "Failed to load teacher")
        }

        setForm({
          name: data.name ?? "",
          idNumber: data.idNumber ?? "",
          birthDate: toDateInputValue(data.birthDate),
          city: data.city ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          specialization: data.specialties ?? "",
          status: (data.status as any) ?? "פעיל",
          bio: data.notes ?? "",
          centerHourlyRate: typeof data.rateCenter === "number" ? data.rateCenter : 50,
          travelRate: typeof data.rateTravel === "number" ? data.rateTravel : 30,
          externalCourseRate: typeof data.rateExternal === "number" ? data.rateExternal : 80,
        })
      } catch (e: any) {
        setError(e?.message || "שגיאה בטעינת מורה")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [teacherId])

  // ✅ שמירה (PUT ואם השרת מחזיר 405 ננסה PATCH)
  const handleSave = async () => {
    try {
      setError(null)
      setSubmitting(true)

      if (!form.name.trim()) {
        setError("חובה להזין שם מלא")
        return
      }
      if (!form.email.trim()) {
        setError("חובה להזין אימייל")
        return
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,

        status: form.status || "פעיל",
        idNumber: form.idNumber.trim() || null,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        city: form.city || null,
        specialties: form.specialization.trim() || null,
        notes: form.bio.trim() || null,
        rateCenter: Number.isFinite(Number(form.centerHourlyRate)) ? Number(form.centerHourlyRate) : null,
        rateTravel: Number.isFinite(Number(form.travelRate)) ? Number(form.travelRate) : null,
        rateExternal: Number.isFinite(Number(form.externalCourseRate)) ? Number(form.externalCourseRate) : null,
      }

      let res = await fetch(`/api/teachers/${teacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      // אם ה-route שלך כתוב כ-PATCH ולא PUT
      if (res.status === 405) {
        res = await fetch(`/api/teachers/${teacherId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "שגיאה בעדכון מורה")
      }

      router.push("/dashboard/teachers")
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "שגיאה בעדכון מורה")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
        <div className="text-sm text-muted-foreground">טוען נתוני מורה...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">עריכת מורה</h1>
            <p className="text-muted-foreground mt-2">עדכן פרטים בסיסיים של המורה</p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50/60">
            <CardContent className="p-4">
              <div className="font-semibold text-red-700">שגיאה</div>
              <div className="text-sm text-red-700/80 mt-1 whitespace-pre-wrap">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
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
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
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

        {/* Personal info */}
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
                שם מלא *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="לדוגמה: ד״ר משה לוי"
                className="text-lg"
                required
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
                  value={form.idNumber}
                  onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
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
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                עיר
              </Label>
              <CityCombobox
                value={form.city}
                onChange={(value) => setForm({ ...form, city: value })}
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
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
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
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="מידע על המורה, ניסיון מקצועי וכו׳"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact info */}
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
                אימייל *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="teacher@robotics.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                טלפון
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="050-1234567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rates */}
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
                value={form.centerHourlyRate}
                onChange={(e) => setForm({ ...form, centerHourlyRate: Number(e.target.value) })}
                placeholder="50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="travelRate">נסיעות (₪)</Label>
              <Input
                id="travelRate"
                type="number"
                value={form.travelRate}
                onChange={(e) => setForm({ ...form, travelRate: Number(e.target.value) })}
                placeholder="30"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="externalCourseRate">מחיר שעה בקורס חיצוני (₪)</Label>
              <Input
                id="externalCourseRate"
                type="number"
                value={form.externalCourseRate}
                onChange={(e) => setForm({ ...form, externalCourseRate: Number(e.target.value) })}
                placeholder="80"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="lg" onClick={() => router.back()} disabled={submitting}>
            ביטול
          </Button>

          <Button
            size="lg"
            onClick={handleSave}
            disabled={submitting || !form.name.trim() || !form.email.trim()}
          >
            {submitting ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      </div>
    </div>
  )
}
