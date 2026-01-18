"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Pencil, Eye, Plus, RefreshCw } from "lucide-react"

type Course = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState("")

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch("/api/courses", { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setCourses(data ?? [])
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    const ok = confirm("למחוק את הקורס?")
    if (!ok) return
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert(`מחיקה נכשלה (${res.status})`)
      return
    }
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return courses
    return courses.filter((c) => c.name.toLowerCase().includes(s))
  }, [q, courses])

  return (
    <div dir="rtl" className="container mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">קורסים</h1>
          <p className="text-muted-foreground mt-1">ניהול קורסים במערכת</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            רענן
          </Button>

          <Link href="/dashboard/courses/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              קורס חדש
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חפש לפי שם קורס..."
            className="max-w-md"
          />
          <div className="text-sm text-muted-foreground">
            סה״כ: {filtered.length}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-muted-foreground">טוען...</div>
      ) : err ? (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-red-700 font-semibold">שגיאה</div>
          <div className="text-red-700/80 mt-1">{err}</div>
          <div className="mt-4">
            <Button variant="outline" onClick={load}>נסה שוב</Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">אין קורסים</Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5 space-y-3">
              <div className="font-bold text-lg">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                נוצר: {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(c.createdAt))}
              </div>

              <div className="flex gap-2 justify-start">
                <Link href={`/dashboard/courses/${c.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    צפה
                  </Button>
                </Link>

                <Link href={`/dashboard/courses/${c.id}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    ערוך
                  </Button>
                </Link>

                <Button variant="destructive" className="gap-2" onClick={() => remove(c.id)}>
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
