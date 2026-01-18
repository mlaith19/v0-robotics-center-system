"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Save, Upload, X, Loader2, Hash, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

interface CenterSettings {
  id?: number
  center_name: string
  logo: string
  phone: string
  whatsapp: string
  address: string
  // Numbers tab fields
  lesson_price?: number
  monthly_price?: number
  registration_fee?: number
  discount_siblings?: number
  max_students_per_class?: number
  // Other tab fields
  email?: string
  website?: string
  working_hours?: string
  notes?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SettingsPage() {
  const { data: settingsData, error, mutate, isLoading } = useSWR<CenterSettings>("/api/settings", fetcher)
  
  const [settings, setSettings] = useState<CenterSettings>({
    center_name: "",
    logo: "",
    phone: "",
    whatsapp: "",
    address: "",
    lesson_price: 0,
    monthly_price: 0,
    registration_fee: 0,
    discount_siblings: 0,
    max_students_per_class: 0,
    email: "",
    website: "",
    working_hours: "",
    notes: "",
  })
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (settingsData && !error) {
      setSettings({
        id: settingsData.id,
        center_name: settingsData.center_name || "",
        logo: settingsData.logo || "",
        phone: settingsData.phone || "",
        whatsapp: settingsData.whatsapp || "",
        address: settingsData.address || "",
        lesson_price: settingsData.lesson_price || 0,
        monthly_price: settingsData.monthly_price || 0,
        registration_fee: settingsData.registration_fee || 0,
        discount_siblings: settingsData.discount_siblings || 0,
        max_students_per_class: settingsData.max_students_per_class || 0,
        email: settingsData.email || "",
        website: settingsData.website || "",
        working_hours: settingsData.working_hours || "",
        notes: settingsData.notes || "",
      })
      if (settingsData.logo) {
        setLogoPreview(settingsData.logo)
      }
    }
  }, [settingsData, error])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setSettings({ ...settings, logo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview("")
    setSettings({ ...settings, logo: "" })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: settings.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      const savedSettings = await response.json()
      mutate(savedSettings)
      
      toast({
        title: "ההגדרות נשמרו בהצלחה",
        description: "פרטי המרכז עודכנו במערכת",
      })
    } catch (err) {
      toast({
        title: "שגיאה בשמירת ההגדרות",
        description: "אנא נסה שנית",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground mt-2">הגדרות מערכת ותצורה</p>
      </div>

      <Tabs defaultValue="general" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 mb-6" dir="rtl">
          <TabsTrigger value="general" className="flex items-center justify-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>כללי</span>
          </TabsTrigger>
          <TabsTrigger value="numbers" className="flex items-center justify-center gap-2">
            <Hash className="h-4 w-4" />
            <span>מספרים</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center justify-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>אחר</span>
          </TabsTrigger>
        </TabsList>

        {/* טאב כללי */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                פרטי המרכז
              </CardTitle>
              <CardDescription>הגדר את פרטי המרכז שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* שם המרכז */}
              <div className="space-y-2">
                <Label htmlFor="centerName" className="text-right block">שם המרכז *</Label>
                <Input
                  id="centerName"
                  placeholder="לדוגמה: מרכז הרובוטיקה"
                  value={settings.center_name}
                  onChange={(e) => setSettings({ ...settings, center_name: e.target.value })}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              {/* לוגו */}
              <div className="space-y-2">
                <Label>לוגו המרכז</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        className="h-24 w-24 object-contain rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 border-2 border-dashed rounded flex items-center justify-center bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} className="max-w-[250px]" />
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG עד 2MB</p>
                  </div>
                </div>
              </div>

              {/* מספרי טלפון */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">מספר נייד *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="050-1234567"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-right block">מספר WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="050-1234567"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* כתובת */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-right block">כתובת המרכז *</Label>
                <Textarea
                  id="address"
                  placeholder="רחוב 123, עיר, מיקוד"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  rows={3}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* טאב מספרים */}
        <TabsContent value="numbers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                מחירים והגדרות מספריות
              </CardTitle>
              <CardDescription>הגדר מחירים והגבלות מספריות</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonPrice" className="text-right block">מחיר שיעור בודד (בש"ח)</Label>
                  <Input
                    id="lessonPrice"
                    type="number"
                    placeholder="0"
                    value={settings.lesson_price || ""}
                    onChange={(e) => setSettings({ ...settings, lesson_price: Number(e.target.value) })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice" className="text-right block">מחיר חודשי (בש"ח)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    placeholder="0"
                    value={settings.monthly_price || ""}
                    onChange={(e) => setSettings({ ...settings, monthly_price: Number(e.target.value) })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationFee" className="text-right block">דמי רישום (בש"ח)</Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    placeholder="0"
                    value={settings.registration_fee || ""}
                    onChange={(e) => setSettings({ ...settings, registration_fee: Number(e.target.value) })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountSiblings" className="text-right block">הנחת אחים (%)</Label>
                  <Input
                    id="discountSiblings"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={settings.discount_siblings || ""}
                    onChange={(e) => setSettings({ ...settings, discount_siblings: Number(e.target.value) })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents" className="text-right block">מספר תלמידים מקסימלי בכיתה</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="0"
                  value={settings.max_students_per_class || ""}
                  onChange={(e) => setSettings({ ...settings, max_students_per_class: Number(e.target.value) })}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* טאב אחר */}
        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                הגדרות נוספות
              </CardTitle>
              <CardDescription>הגדרות נוספות של המרכז</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">כתובת אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@domain.com"
                    value={settings.email || ""}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-right block">אתר אינטרנט</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={settings.website || ""}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours" className="text-right block">שעות פעילות</Label>
                <Textarea
                  id="workingHours"
                  placeholder="ראשון-חמישי: 08:00-20:00&#10;שישי: 08:00-13:00"
                  value={settings.working_hours || ""}
                  onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                  rows={3}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-right block">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  placeholder="הערות כלליות על המרכז..."
                  value={settings.notes || ""}
                  onChange={(e) => setSettings({ ...settings, notes: e.target.value })}
                  rows={4}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* כפתור שמירה - מוצג תמיד */}
      <div className="flex justify-start">
        <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              שמור הגדרות
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
