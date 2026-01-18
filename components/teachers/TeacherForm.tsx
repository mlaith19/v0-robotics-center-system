"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type TeacherFormValues = {
  name: string
  email: string
  phone: string

  status: string
  idNumber: string
  birthDate: string
  city: string
  specialties: string
  notes: string

  rateCenter: string
  rateTravel: string
  rateExternal: string
}

export function TeacherForm({
  value,
  onChange,
  onSubmit,
  submitText = "שמור",
  cancelHref = "/dashboard/teachers",
  disabled = false,
}: {
  value: TeacherFormValues
  onChange: (patch: Partial<TeacherFormValues>) => void
  onSubmit: () => void
  submitText?: string
  cancelHref?: string
  disabled?: boolean
}) {
  const statusOptions = useMemo(() => ["פעיל", "לא פעיל", "בהמתנה"], [])

  return (
    <div className="space-y-6">
      {/* סטטוס */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">סטטוס המורה</h2>
            <p className="text-sm text-muted-foreground">בחר את סטטוס המורה הנוכחי</p>
          </div>
        </div>

        <div className="max-w-sm">
          <Select
            value={value.status}
            onValueChange={(v) => onChange({ status: v })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סטטוס" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* מידע אישי */}
      <Card className="p-6 space-y-4 border border-green-200/40">
        <div>
          <h2 className="text-lg font-semibold">מידע אישי</h2>
          <p className="text-sm text-muted-foreground">פרטים זיהוי בסיסיים של המורה</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>שם מלא *</Label>
            <Input
              value={value.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="לדוגמה: דני משה לוי"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>תאריך לידה</Label>
            <Input
              type="date"
              value={value.birthDate}
              onChange={(e) => onChange({ birthDate: e.target.value })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>תעודת זהות</Label>
            <Input
              value={value.idNumber}
              onChange={(e) => onChange({ idNumber: e.target.value })}
              placeholder="123456789"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>עיר</Label>
            <Input
              value={value.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="בחר עיר / כתוב עיר"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>התמחויות</Label>
            <Input
              value={value.specialties}
              onChange={(e) => onChange({ specialties: e.target.value })}
              placeholder="רובוטיקה, תכנות, אלקטרוניקה וכו'"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>הערות</Label>
            <Textarea
              value={value.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="מידע על המורה, ניסיון מקצועי וכו'"
              disabled={disabled}
            />
          </div>
        </div>
      </Card>

      {/* פרטי קשר */}
      <Card className="p-6 space-y-4 border border-blue-200/40">
        <div>
          <h2 className="text-lg font-semibold">פרטי קשר</h2>
          <p className="text-sm text-muted-foreground">מידע ליצירת קשר עם המורה</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>אימייל</Label>
            <Input
              value={value.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="teacher@robotics.com"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>טלפון</Label>
            <Input
              value={value.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="050-1234567"
              disabled={disabled}
            />
          </div>
        </div>
      </Card>

      {/* תעריפים */}
      <Card className="p-6 space-y-4 border border-orange-200/40 bg-orange-50/30">
        <div>
          <h2 className="text-lg font-semibold">תעריפים</h2>
          <p className="text-sm text-muted-foreground">הגדרת מחירי השעה במרכז/נסיעות/חיצוני</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>מחיר שעה במרכז (₪)</Label>
            <Input
              inputMode="numeric"
              value={value.rateCenter}
              onChange={(e) => onChange({ rateCenter: e.target.value })}
              placeholder="50"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>נסיעות (₪)</Label>
            <Input
              inputMode="numeric"
              value={value.rateTravel}
              onChange={(e) => onChange({ rateTravel: e.target.value })}
              placeholder="30"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>מחיר שעה בקורס חיצוני (₪)</Label>
            <Input
              inputMode="numeric"
              value={value.rateExternal}
              onChange={(e) => onChange({ rateExternal: e.target.value })}
              placeholder="80"
              disabled={disabled}
            />
          </div>
        </div>
      </Card>

      {/* פעולות */}
      <div className="flex gap-3 justify-end">
        <a href={cancelHref}>
          <Button variant="outline" type="button" disabled={disabled}>
            ביטול
          </Button>
        </a>
        <Button type="button" onClick={onSubmit} disabled={disabled}>
          {submitText}
        </Button>
      </div>
    </div>
  )
}
