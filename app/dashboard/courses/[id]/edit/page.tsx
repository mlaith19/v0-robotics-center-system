"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch(`/api/courses/${params.id}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const data = await res.json()
        setName(data?.name ?? "")
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
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? `Failed (${res.status})`)
      }
      router.push(`/dashboard/courses/${params.id}`)
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/courses/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">עריכת קורס</h1>
          <p className="text-muted-foreground mt-1">עדכן פרטי קורס</p>
        </div>
      </div>

      {err && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          שגיאה: {err}
        </Card>
      )}

      <Card className="p-6 space-y-4">
        {loading ? (
          <div className="text-muted-foreground">טוען...</div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="font-medium">שם קורס *</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex gap-2 justify-start">
              <Button onClick={save} disabled={!name.trim() || saving}>
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
