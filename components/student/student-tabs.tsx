"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, DollarSign, Receipt, CalendarCheck } from "lucide-react"

type Course = {
  id: string
  name: string
}

type Enrollment = {
  id: string
  sessionsLeft: number
  status: string
  joinedAt: string
  course: Course
}

type Payment = {
  id: string
  amount: number
  status: "PAID" | "PENDING" | "CANCELED"
  method: "CASH" | "CREDIT" | "BANK_TRANSFER" | "BIT" | "PAYBOX" | "OTHER"
  paidAt: string
  note?: string | null
}

type Attendance = {
  id: string
  date: string
  status: "PRESENT" | "ABSENT"
  hours: number
  note?: string | null
  course?: { id: string; name: string } | null
}

function formatDate(dateString?: string) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("he-IL").format(d)
}

function formatDateTime(dateString?: string) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(d)
}

function paymentStatusHe(s: Payment["status"]) {
  if (s === "PAID") return "שולם"
  if (s === "PENDING") return "ממתין"
  return "בוטל"
}

function paymentMethodHe(m: Payment["method"]) {
  switch (m) {
    case "CASH":
      return "מזומן"
    case "CREDIT":
      return "אשראי"
    case "BANK_TRANSFER":
      return "העברה בנקאית"
    case "BIT":
      return "ביט"
    case "PAYBOX":
      return "פייבוקס"
    default:
      return "אחר"
  }
}

function attendanceStatusHe(s: Attendance["status"]) {
  return s === "PRESENT" ? "נוכח" : "נעדר"
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
  const paymentsSummary = useMemo(() => {
    const paid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0)
    const pending = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0)
    const total = paid + pending
    return { paid, pending, total }
  }, [payments])

  const attendanceSummary = useMemo(() => {
    const total = attendances.length
    const present = attendances.filter((a) => a.status === "PRESENT").length
    const percent = total === 0 ? 0 : Math.round((present / total) * 100)
    const hours = attendances.reduce((sum, a) => sum + (a.hours ?? 0), 0)
    return { total, present, percent, hours }
  }, [attendances])

  return (
    <Tabs defaultValue="general" className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">כללי</TabsTrigger>
        <TabsTrigger value="courses">קורסים</TabsTrigger>
        <TabsTrigger value="payments">תשלומים</TabsTrigger>
        <TabsTrigger value="attendance">נוכחות</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 mt-6">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">סיכום מהיר</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">קורסים פעילים</div>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">שולם</div>
              <div className="text-2xl font-bold">{paymentsSummary.paid.toLocaleString()} ₪</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">נוכחות</div>
              <div className="text-2xl font-bold">{attendanceSummary.percent}%</div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="courses" className="space-y-4 mt-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">קורסים רשומים</h4>

          {enrollments.length > 0 ? (
            enrollments.map((enr) => (
              <Card key={enr.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h5 className="font-semibold text-foreground">{enr.course.name}</h5>
                    <div className="text-xs text-muted-foreground">
                      הצטרף: {formatDate(enr.joinedAt)} · סטטוס: {enr.status}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-0.5">יתרת מפגשים</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{enr.sessionsLeft}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">התלמיד אינו רשום לאף קורס כרגע</p>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="payments" className="space-y-4 mt-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-700 dark:text-green-400">שולם</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{paymentsSummary.paid.toLocaleString()} ₪</p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-orange-700 dark:text-orange-400">ממתין</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{paymentsSummary.pending.toLocaleString()} ₪</p>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-blue-700 dark:text-blue-400">סה"כ</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{paymentsSummary.total.toLocaleString()} ₪</p>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">היסטוריית תשלומים</h4>

          {payments.length > 0 ? (
            payments.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{formatDateTime(p.paidAt)}</div>
                    <div className="text-sm text-muted-foreground">שיטה: {paymentMethodHe(p.method)}</div>
                    {p.note ? <div className="text-xs text-muted-foreground">הערה: {p.note}</div> : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{p.amount.toLocaleString()} ₪</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.status === "PAID"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : p.status === "PENDING"
                          ? "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {paymentStatusHe(p.status)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">אין תשלומים לתלמיד הזה עדיין</p>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="attendance" className="space-y-4 mt-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-700 dark:text-green-400">נוכחות</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{attendanceSummary.percent}%</p>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-blue-700 dark:text-blue-400">שיעורים</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {attendanceSummary.present}/{attendanceSummary.total}
            </p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-orange-700 dark:text-orange-400">שעות</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{attendanceSummary.hours}</p>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">רשומות נוכחות</h4>

          {attendances.length > 0 ? (
            attendances.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{formatDateTime(a.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      קורס: {a.course?.name ?? "—"} · שעות: {a.hours}
                    </div>
                    {a.note ? <div className="text-xs text-muted-foreground">הערה: {a.note}</div> : null}
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      a.status === "PRESENT"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                    }`}
                  >
                    {attendanceStatusHe(a.status)}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">אין נוכחות לתלמיד הזה עדיין</p>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
