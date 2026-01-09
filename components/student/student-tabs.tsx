"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CalendarCheck, Receipt, DollarSign } from "lucide-react"

type Course = {
  id: string
  name: string
}

type Enrollment = {
  id: string
  sessionsLeft: number
  joinedAt: string | Date
  course: Course
}

type Payment = {
  id: string
  amount: number
  method?: string | null
  status: string
  note?: string | null
  paidAt: string | Date
  courseId?: string | null
  course?: Course | null
}

type Attendance = {
  id: string
  date: string | Date
  status: string
  minutes: number
  note?: string | null
  course: Course
}

function fmtDate(v: any) {
  if (!v) return "—"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short" }).format(d)
}

function fmtDateTime(v: any) {
  if (!v) return "—"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(d)
}

export function StudentTabs({
  enrollments,
  payments,
  attendances,
}: {
  enrollments: Enrollment[]
  payments: Payment[]
  attendances: Attendance[]
}) {
  const stats = useMemo(() => {
    const totalPaid = payments
      .filter((p) => (p.status ?? "שולם") === "שולם")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const totalPending = payments
      .filter((p) => (p.status ?? "שולם") !== "שולם")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const total = totalPaid + totalPending

    const totalAttend = attendances.length
    const present = attendances.filter((a) => (a.status ?? "נוכח") === "נוכח").length
    const percent = totalAttend > 0 ? Math.round((present / totalAttend) * 100) : 0

    return { totalPaid, totalPending, total, totalAttend, present, percent }
  }, [payments, attendances])

  return (
    <Tabs defaultValue="general" className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">כללי</TabsTrigger>
        <TabsTrigger value="courses">קורסים</TabsTrigger>
        <TabsTrigger value="payments">תשלומים</TabsTrigger>
        <TabsTrigger value="attendance">נוכחות</TabsTrigger>
      </TabsList>

      {/* כללי */}
      <TabsContent value="general" className="space-y-4 mt-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">קורסים רשומים</p>
            </div>
            <p className="text-2xl font-bold">{enrollments.length}</p>
          </Card>

          <Card className="p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">שולם</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalPaid.toLocaleString("he-IL")} ₪</p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">נוכחות</p>
            </div>
            <p className="text-2xl font-bold">{stats.percent}%</p>
          </Card>
        </div>
      </TabsContent>

      {/* קורסים */}
      <TabsContent value="courses" className="space-y-4 mt-6">
        <h4 className="font-semibold text-foreground">קורסים רשומים</h4>

        {enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <Card key={e.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h5 className="font-semibold text-foreground">{e.course?.name ?? "קורס"}</h5>
                    <p className="text-sm text-muted-foreground">נרשם בתאריך: {fmtDate(e.joinedAt)}</p>
                  </div>

                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">יתרת מפגשים</div>
                    <div className="text-2xl font-bold">{e.sessionsLeft ?? 0}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">התלמיד אינו רשום לאף קורס כרגע</p>
          </Card>
        )}
      </TabsContent>

      {/* תשלומים */}
      <TabsContent value="payments" className="space-y-4 mt-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">שולם</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalPaid.toLocaleString("he-IL")} ₪</p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">ממתין</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalPending.toLocaleString("he-IL")} ₪</p>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">סה"כ</p>
            </div>
            <p className="text-2xl font-bold">{stats.total.toLocaleString("he-IL")} ₪</p>
          </Card>
        </div>

        <h4 className="font-semibold text-foreground">היסטוריית תשלומים</h4>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{fmtDateTime(p.paidAt)}</div>
                    <div className="text-sm text-muted-foreground">
                      שיטה: {p.method ?? "—"} | קורס: {p.course?.name ?? "—"}
                    </div>
                    {p.note ? <div className="text-sm text-muted-foreground">הערה: {p.note}</div> : null}
                  </div>

                  <div className="text-left">
                    <div className="text-lg font-bold">{(Number(p.amount) || 0).toLocaleString("he-IL")} ₪</div>
                    <span
                      className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                        (p.status ?? "שולם") === "שולם"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                      }`}
                    >
                      {p.status ?? "שולם"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">אין תשלומים עדיין</p>
          </Card>
        )}
      </TabsContent>

      {/* נוכחות */}
      <TabsContent value="attendance" className="space-y-4 mt-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">נוכחות</p>
            </div>
            <p className="text-2xl font-bold">{stats.percent}%</p>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">שיעורים</p>
            </div>
            <p className="text-2xl font-bold">
              {stats.present}/{stats.totalAttend}
            </p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4" />
              <p className="text-xs text-muted-foreground">רשומות</p>
            </div>
            <p className="text-2xl font-bold">{attendances.length}</p>
          </Card>
        </div>

        <h4 className="font-semibold text-foreground">רשומות נוכחות</h4>

        {attendances.length > 0 ? (
          <div className="space-y-3">
            {attendances.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{fmtDateTime(a.date)}</div>
                    <div className="text-sm text-muted-foreground">קורס: {a.course?.name ?? "—"}</div>
                    {a.note ? <div className="text-sm text-muted-foreground">הערה: {a.note}</div> : null}
                  </div>

                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">{a.minutes ?? 0} דק׳</div>
                    <span
                      className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                        (a.status ?? "נוכח") === "נוכח"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}
                    >
                      {a.status ?? "נוכח"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">אין נוכחות עדיין</p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
