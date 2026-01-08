"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Save, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CenterSettings {
  centerName: string
  logo: string
  phone: string
  whatsapp: string
  address: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CenterSettings>({
    centerName: "",
    logo: "",
    phone: "",
    whatsapp: "",
    address: "",
  })
  const [logoPreview, setLogoPreview] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const savedSettings = localStorage.getItem("robotics-center-settings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      if (parsed.logo) {
        setLogoPreview(parsed.logo)
      }
    }
  }, [])

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

  const handleSave = () => {
    localStorage.setItem("robotics-center-settings", JSON.stringify(settings))
    toast({
      title: "ההגדרות נשמרו בהצלחה",
      description: "פרטי המרכז עודכנו במערכת",
    })
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground mt-2">הגדרות מערכת ותצורה</p>
      </div>

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
            <Label htmlFor="centerName">שם המרכז *</Label>
            <Input
              id="centerName"
              placeholder="לדוגמה: מרכז הרובוטיקה"
              value={settings.centerName}
              onChange={(e) => setSettings({ ...settings, centerName: e.target.value })}
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
              <Label htmlFor="phone">מספר נייד *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="050-1234567"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">מספר WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="050-1234567"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              />
            </div>
          </div>

          {/* כתובת */}
          <div className="space-y-2">
            <Label htmlFor="address">כתובת המרכז *</Label>
            <Textarea
              id="address"
              placeholder="רחוב 123, עיר, מיקוד"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={3}
            />
          </div>

          {/* כפתור שמירה */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              שמור הגדרות
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
