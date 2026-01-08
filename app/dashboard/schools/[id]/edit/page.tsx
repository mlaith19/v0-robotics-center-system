"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Save, Building2, MapPin, Phone, Mail, CreditCard, FileText } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { CityCombobox } from "@/components/ui/combobox-city"

const ISRAELI_BANKS = [
  { code: "10", name: "בנק לאומי" },
  { code: "11", name: "בנק דיסקונט" },
  { code: "12", name: "בנק הפועלים" },
  { code: "13", name: "בנק איגוד" },
  { code: "14", name: "בנק אוצר החייל" },
  { code: "17", name: "בנק מרכנתיל" },
  { code: "20", name: "בנק מזרחי טפחות" },
  { code: "31", name: "בנק הבינלאומי" },
  { code: "46", name: "בנק מסד" },
  { code: "52", name: "בנק פועלי אגודת ישראל" },
  { code: "54", name: "בנק ירושלים" },
]

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
]

export default function EditSchoolPage() {
  const params = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    institutionCode: "",
    city: "",
    address: "",
    schoolPhone: "",
    phone: "",
    email: "",
    contactPerson: "",
    type: "",
    status: "",
    bankName: "",
    bankCode: "",
    bankBranch: "",
    bankAccount: "",
    notes: "",
  })

  useEffect(() => {
    const schools = JSON.parse(localStorage.getItem("robotics-schools") || "[]")
    const found = schools.find((s: any) => s.id === Number(params.id))
    if (found) {
      setFormData({
        name: found.name || "",
        institutionCode: found.institutionCode || "",
        city: found.city || "",
        address: found.address || "",
        schoolPhone: found.schoolPhone || "",
        phone: found.phone || "",
        email: found.email || "",
        contactPerson: found.contactPerson || "",
        type: found.type || "",
        status: found.status || "",
        bankName: found.bankName || "",
        bankCode: found.bankCode || "",
        bankBranch: found.bankBranch || "",
        bankAccount: found.bankAccount || "",
        notes: found.notes || "",
      })
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const schools = JSON.parse(localStorage.getItem("robotics-schools") || "[]")
    const index = schools.findIndex((s: any) => s.id === Number(params.id))

    if (index !== -1) {
      schools[index] = { ...schools[index], ...formData }
      localStorage.setItem("robotics-schools", JSON.stringify(schools))
      router.push(`/dashboard/schools/${params.id}`)
    }
  }

  const handleBankChange = (value: string) => {
    const bank = ISRAELI_BANKS.find((b) => b.name === value)
    setFormData({
      ...formData,
      bankName: value,
      bankCode: bank?.code || "",
    })
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/dashboard/schools/${params.id}`}>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">ערוך בית ספר</h1>
        </div>
        <p className="text-muted-foreground mr-14">עדכן את פרטי בית הספר</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">סטטוס בית הספר</h3>
              <p className="text-sm text-muted-foreground mb-3">בחר את סטטוס בית הספר הנוכחי</p>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מתעניין">מתעניין</SelectItem>
                  <SelectItem value="פעיל">פעיל</SelectItem>
                  <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500 text-white p-2.5 rounded-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">מידע כללי</h3>
              <p className="text-sm text-muted-foreground">פרטי בית הספר הבסיסיים</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-base font-medium">
                  שם בית הספר *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionCode" className="text-base font-medium">
                  קוד מוסד
                </Label>
                <Input
                  id="institutionCode"
                  value={formData.institutionCode}
                  onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value })}
                  className="h-12 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-base font-medium">
                  סוג בית הספר
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type" className="h-12 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="יסודי">יסודי</SelectItem>
                    <SelectItem value="חטיבת ביניים">חטיבת ביניים</SelectItem>
                    <SelectItem value="תיכון">תיכון</SelectItem>
                    <SelectItem value="מקיף">מקיף</SelectItem>
                    <SelectItem value="ממלכתי דתי">ממלכתי דתי</SelectItem>
                    <SelectItem value="אחר">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 text-white p-2.5 rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">מיקום</h3>
              <p className="text-sm text-muted-foreground">כתובת בית הספר</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-medium">
                  עיר *
                </Label>
                <CityCombobox
                  value={formData.city}
                  onChange={(value) => setFormData({ ...formData, city: value })}
                  placeholder="בחר עיר"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-medium">
                  כתובת *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-12 bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolPhone" className="text-base font-medium">
                  טלפון בית ספר
                </Label>
                <Input
                  id="schoolPhone"
                  type="tel"
                  value={formData.schoolPhone}
                  onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                  className="h-12 bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-cyan-500 text-white p-2.5 rounded-lg">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">פרטי קשר</h3>
              <p className="text-sm text-muted-foreground">איש קשר בבית הספר</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-base font-medium">
                איש קשר *
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="h-12 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  טלפון נייד *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  אימייל *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-white"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 text-white p-2.5 rounded-lg">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">פרטי חשבון בנק</h3>
              <p className="text-sm text-muted-foreground">מידע חשבון לתשלומים</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-base font-medium">
                בנק
              </Label>
              <Select value={formData.bankName} onValueChange={handleBankChange}>
                <SelectTrigger id="bankName" className="h-12 bg-white">
                  <SelectValue placeholder="בחר בנק" />
                </SelectTrigger>
                <SelectContent>
                  {ISRAELI_BANKS.map((bank) => (
                    <SelectItem key={bank.code} value={bank.name}>
                      {bank.name} ({bank.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankCode" className="text-sm font-medium">
                  קוד בנק
                </Label>
                <Input id="bankCode" value={formData.bankCode} className="h-12 bg-muted/50" readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankBranch" className="text-sm font-medium">
                  סניף
                </Label>
                <Input
                  id="bankBranch"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="h-12 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount" className="text-sm font-medium">
                  מספר חשבון
                </Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="h-12 bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-pink-500 text-white p-2.5 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">מידע נוסף</h3>
              <p className="text-sm text-muted-foreground">הערות ומידע משלים</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              הערות
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="resize-none bg-white"
            />
          </div>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" className="gap-2 h-12 px-8">
            <Save className="h-5 w-5" />
            שמור שינויים
          </Button>
          <Link href={`/dashboard/schools/${params.id}`}>
            <Button type="button" variant="outline" size="lg" className="h-12 px-8 bg-transparent">
              ביטול
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
