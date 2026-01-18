"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

type Teacher = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export default function EditTeacherPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (!id) return
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/teachers/${id}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load teacher (${res.status})`)

        const t = (await res.json()) as Teacher | null
        if (!t) throw new Error("מורה לא נמצא")

        if (!cancelled) {
          setForm({
            name: t.name ?? "",
            email: t.email ?? "",
            phone: t.phone ?? "",
          })
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "שגיאה בטעינת מורה")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  const onSave = async () => {
    if (!id) return
    try {
      setSaving(true)
      setError(null)

      const res = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
        }),
      })

      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(txt || `Failed to update teacher (${res.status})`)
      }

      router.push(`/dashboard/teachers/${id}`)
      router.refresh()
    } catch (e: any) {
      setError(e?.message ?? "שגיאה בשמירה")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">טוען...</div>

  return (
    <div dir="rtl" className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/teachers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">עריכת מורה</h1>
          <p className="text-muted-foreground mt-1">עדכן פרטים בסיסיים</p>
        </div>
      </div>

      {error && (
        <div className="border rounded-lg p-4">
          <div className="text-red-600 font-medium">שגיאה</div>
          <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{error}</div>
        </div>
      )}

      <Card className="p-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">שם *</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="flex gap-3 justify-start pt-2">
          <Button onClick={onSave} disabled={saving || !form.name.trim()}>
            {saving ? "שומר..." : "שמור שינויים"}
          </Button>

          <Link href={`/dashboard/teachers/${id}`}>
            <Button variant="outline" className="bg-transparent">
              ביטול
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
