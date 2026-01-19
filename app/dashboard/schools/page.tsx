"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Pencil, Eye, Plus, RefreshCw, School as SchoolIcon } from "lucide-react"

type School = {
  id: string
  name: string
  city: string | null
  address: string | null
  phone: string | null
  email: string | null
  contactName: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState("")

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch("/api/schools", { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setSchools(data ?? [])
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    const ok = confirm("למחוק את בית הספר?")
    if (!ok) return
    const res = await fetch(`/api/schools/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert(`מחיקה נכשלה (${res.status})`)
      return
    }
    setSchools((prev) => prev.filter((s) => s.id !== id))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return schools
    return schools.filter((x) => (x.name ?? "").toLowerCase().includes(s))
  }, [q, schools])

  return (
    <div dir="rtl" className="container mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">בתי ספר</h1>
          <p className="text-muted-foreground mt-1">ניהול בתי ספר במערכת</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            רענן
          </Button>

          <Link href="/dashboard/schools/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              בית ספר חדש
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חפש לפי שם בית ספר..."
            className="max-w-md"
          />
          <div className="text-sm text-muted-foreground">סה״כ: {filtered.length}</div>
        </div>
      </Card>

      {loading ? (
        <div className="text-muted-foreground">טוען...</div>
      ) : err ? (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-red-700 font-semibold">שגיאה</div>
          <div className="text-red-700/80 mt-1">{err}</div>
          <div className="mt-4">
            <Button variant="outline" onClick={load}>
              נסה שוב
            </Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">אין בתי ספר</Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SchoolIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-bold text-lg">{s.name}</div>
              </div>

              <div className="text-sm text-muted-foreground">
                {s.city ? `עיר: ${s.city}` : "עיר: —"}
              </div>

              <div className="flex gap-2 justify-start">
                <Link href={`/dashboard/schools/${s.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    צפה
                  </Button>
                </Link>

                <Link href={`/dashboard/schools/${s.id}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    ערוך
                  </Button>
                </Link>

                <Button variant="destructive" className="gap-2" onClick={() => remove(s.id)}>
                  <Trash2 className="h-4 w-4" />
                  מחק
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
