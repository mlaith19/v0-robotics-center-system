"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Mail, Phone, User, Edit, BookOpen, Receipt, CalendarCheck } from "lucide-react"

type Teacher = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  createdAt?: string
  updatedAt?: string
  teacherCourses?: { course: { id: string; name: string } }[]
  payments?: {
    id: string
    date: string
    amount: number
    status: string
    method?: string | null
    note?: string | null
  }[]
  attendance?: {
    id: string
    date: string
    status: string
    hours: number
    note?: string | null
    course?: { id: string; name: string } | null
  }[]
}

function fmtDate(d?: string) {
  if (!d) return "-"
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return "-"
  return new Intl.DateTimeFormat("he-IL").format(dt)
}

export default function TeacherViewPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        // דורש שה-API יחזיר כולל relations (מוסבר למטה אם חסר לך)
        const res = await fetch(`/api/teachers/${id}?include=1`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load teacher (${res.status})`)

        const data = (await res.json()) as Teacher | null
        if (!cancelled) setTeacher(data)
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

  const courses = useMemo(() => teacher?.teacherCourses?.map((x) => x.course) ?? [], [teacher])
  const payments = useMemo(() => teacher?.payments ?? [], [teacher])
  const attendance = useMemo(() => teacher?.attendance ?? [], [teacher])

  const paidSum = useMemo(
    () => payments.filter((p) => p.status === "שולם").reduce((s, p) => s + (p.amount ?? 0), 0),
    [payments],
  )
  const pendingSum = useMemo(
    () => payments.filter((p) => p.status !== "שולם").reduce((s, p) => s + (p.amount ?? 0), 0),
    [payments],
  )
  const totalHours = useMemo(() => attendance.reduce((s, a) => s + (a.hours ?? 0), 0), [attendance])
  const presentCount = useMemo(() => attendance.filter((a) => a.status === "נוכח").length, [attendance])
  const totalCount = useMemo(() => attendance.length, [attendance])
  const attendancePct = useMemo(() => (totalCount ? Math.round((presentCount / totalCount) * 100) : 0), [
    presentCount,
    totalCount,
  ])

  if (loading) return <div className="p-6">טוען...</div>

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600 font-medium">שגיאה</div>
        <div className="text-sm text-muted-foreground mt-1">{error}</div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => router.refresh()} className="bg-transparent">
            נסה שוב
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/teachers")} className="bg-transparent">
            חזרה למורים
          </Button>
        </div>
      </div>
    )

  if (!teacher)
    return (
      <div className="p-6">
        <div className="font-medium">מורה לא נמצא</div>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/dashboard/teachers")}>
          חזרה למורים
        </Button>
      </div>
    )

  return (
    <div dir="rtl" className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>

        <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            ערוך
          </Button>
        </Link>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">{teacher.name}</div>
            <div className="text-sm text-muted-foreground">פרטי מורה</div>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{teacher.email ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{teacher.phone ?? "-"}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="general" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">כללי</TabsTrigger>
            <TabsTrigger value="courses">קורסים</TabsTrigger>
            <TabsTrigger value="payments">תשלומים</TabsTrigger>
            <TabsTrigger value="attendance">נוכחות</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">נוצר</div>
                <div className="font-semibold">{fmtDate(teacher.createdAt)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">עודכן</div>
                <div className="font-semibold">{fmtDate(teacher.updatedAt)}</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">קורסים משויכים</h4>
            </div>

            {courses.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {courses.map((c) => (
                  <Card key={c.id} className="p-4">
                    <div className="font-semibold">{c.name}</div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">אין קורסים משויכים למורה</Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  שולם
                </div>
                <div className="text-2xl font-bold">{paidSum.toLocaleString("he-IL")} ₪</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  ממתין
                </div>
                <div className="text-2xl font-bold">{pendingSum.toLocaleString("he-IL")} ₪</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  סה״כ
                </div>
                <div className="text-2xl font-bold">{(paidSum + pendingSum).toLocaleString("he-IL")} ₪</div>
              </Card>
            </div>

            {payments.length ? (
              <div className="space-y-3">
                {payments.map((p) => (
                  <Card key={p.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">{fmtDate(p.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {p.method ? `שיטה: ${p.method}` : "שיטה: -"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold">{p.amount.toLocaleString("he-IL")} ₪</div>
                        <span className="text-xs px-2 py-1 rounded-full border">
                          {p.status}
                        </span>
                      </div>
                    </div>
                    {p.note ? <div className="text-sm text-muted-foreground mt-2">{p.note}</div> : null}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">אין תשלומים למורה</Card>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  נוכחות
                </div>
                <div className="text-2xl font-bold">{attendancePct}%</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  מפגשים
                </div>
                <div className="text-2xl font-bold">
                  {presentCount}/{totalCount}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  שעות
                </div>
                <div className="text-2xl font-bold">{totalHours}</div>
              </Card>
            </div>

            {attendance.length ? (
              <div className="space-y-3">
                {attendance.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{fmtDate(a.date)}</div>
                        <div className="text-sm text-muted-foreground">{a.course?.name ?? "-"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">{a.hours} שעות</div>
                        <span className="text-xs px-2 py-1 rounded-full border">{a.status}</span>
                      </div>
                    </div>
                    {a.note ? <div className="text-sm text-muted-foreground mt-2">{a.note}</div> : null}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">אין רשומות נוכחות למורה</Card>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
