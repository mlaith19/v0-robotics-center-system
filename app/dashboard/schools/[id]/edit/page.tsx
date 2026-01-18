"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    contactName: "",
    notes: "",
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch(`/api/schools/${params.id}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const data = await res.json()

        setForm({
          name: data?.name ?? "",
          city: data?.city ?? "",
          address: data?.address ?? "",
          phone: data?.phone ?? "",
          email: data?.email ?? "",
          contactName: data?.contactName ?? "",
          notes: data?.notes ?? "",
        })
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id])

  async function save() {
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch(`/api/schools/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? `Failed (${res.status})`)
      }
      router.push(`/dashboard/schools/${params.id}`)
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/schools/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">עריכת בית ספר</h1>
          <p className="text-muted-foreground mt-1">עדכן פרטי בית ספר</p>
        </div>
      </div>

      {err && <Card className="p-4 border-red-200 bg-red-50 text-red-700">שגיאה: {err}</Card>}

      <Card className="p-6 space-y-4">
        {loading ? (
          <div className="text-muted-foreground">טוען...</div>
        ) : (
          <>
            <div className="grid gap-2">
              <div className="font-medium">שם בית ספר *</div>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="font-medium">עיר</div>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <div className="font-medium">איש קשר</div>
                <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">כתובת</div>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="font-medium">טלפון</div>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <div className="font-medium">אימייל</div>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">הערות</div>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
            </div>

            <div className="flex gap-2 justify-start">
              <Button onClick={save} disabled={!form.name.trim() || saving}>
                {saving ? "שומר..." : "שמור"}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                ביטול
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
