"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, BookOpen, Save, Loader2 } from "lucide-react"

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "beginner",
    duration: 60,
    price: 0,
    status: "active"
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch(`/api/courses/${params.id}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const data = await res.json()
        setFormData({
          name: data?.name ?? "",
          description: data?.description ?? "",
          level: data?.level ?? "beginner",
          duration: data?.duration ?? 60,
          price: data?.price ?? 0,
          status: data?.status ?? "active"
        })
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id])

  async function save() {
    if (!formData.name.trim()) {
      setErr("שם הקורס הוא שדה חובה")
      return
    }
    
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div dir="rtl" className="container mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/courses/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">עריכת קורס</h1>
          <p className="text-muted-foreground mt-1">עדכן את פרטי הקורס</p>
        </div>
      </div>

      {err && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-700">
          שגיאה: {err}
        </Card>
      )}

      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex flex-row-reverse items-center justify-end gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            פרטי הקורס
          </CardTitle>
          <CardDescription className="text-right">עדכן את פרטי הקורס</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* שם קורס */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">שם הקורס *</Label>
            <Input 
              id="name"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="לדוגמה: רובוטיקה מתחילים"
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* תיאור */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block">תיאור הקורס</Label>
            <Textarea 
              id="description"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="תיאור קצר של הקורס, מה ילמדו התלמידים..."
              rows={4}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* רמה ומשך */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level" className="text-right block">רמת הקורס</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => setFormData({...formData, level: value})}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue placeholder="בחר רמה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">מתחילים</SelectItem>
                  <SelectItem value="intermediate">מתקדמים</SelectItem>
                  <SelectItem value="advanced">מומחים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-right block">משך שיעור (דקות)</Label>
              <Input 
                id="duration"
                type="number"
                value={formData.duration} 
                onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})} 
                placeholder="60"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* מחיר וסטטוס */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-right block">מחיר (בש"ח)</Label>
              <Input 
                id="price"
                type="number"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                placeholder="0"
                className="text-right"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-right block">סטטוס</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="draft">טיוטה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* כפתורים */}
          <div className="flex gap-2 justify-start pt-4 border-t">
            <Button onClick={save} disabled={!formData.name.trim() || saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "שומר..." : "שמור שינויים"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              ביטול
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
