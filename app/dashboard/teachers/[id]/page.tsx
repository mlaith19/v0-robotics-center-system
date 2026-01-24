"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Mail, Phone, User, Edit, BookOpen, Receipt, CalendarCheck, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Teacher = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  idNumber?: string | null
  birthDate?: string | null
  city?: string | null
  specialty?: string | null
  status?: string | null
  bio?: string | null
  centerHourlyRate?: number | null
  travelRate?: number | null
  externalCourseRate?: number | null
  createdAt?: string
  updatedAt?: string
  teacherCourses?: { 
    course: { 
      id: string
      name: string
      daysOfWeek?: string[]
      startTime?: string
      endTime?: string
      startDate?: string
      endDate?: string
      price?: number
      status?: string
      location?: string
      enrollmentCount?: number
    } 
  }[]
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
  const [teacherExpenses, setTeacherExpenses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([]) // Declare payments variable

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "transfer" | "check" | "bit">("cash")
  const [paymentDescription, setPaymentDescription] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [cardLastDigits, setCardLastDigits] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankBranch, setBankBranch] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  const israeliBanks = [
    "בנק לאומי",
    "בנק הפועלים",
    "בנק דיסקונט",
    "בנק מזרחי טפחות",
    "בנק מרכנתיל",
    "בנק הבינלאומי הראשון",
    "בנק אוצר החייל",
    "בנק יהב",
    "בנק ירושלים",
    "בנק מסד",
    "בנק הדואר",
    "וואן זירו (ONE ZERO)",
  ]

  // Course dialog state
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)

  // Attendance dialog state
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [isAddingAttendance, setIsAddingAttendance] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceHours, setAttendanceHours] = useState("")
  const [attendanceStatus, setAttendanceStatus] = useState<"נוכח" | "חיסור" | "איחור">("נוכח")
  const [attendanceCourseId, setAttendanceCourseId] = useState("")
  const [attendanceNote, setAttendanceNote] = useState("")

  const openCourseDialog = (course) => {
    setSelectedCourse(course)
    setIsCourseDialogOpen(true)
  }

  const daysMap: Record<string, string> = {
    sunday: "ראשון",
    monday: "שני",
    tuesday: "שלישי",
    wednesday: "רביעי",
    thursday: "חמישי",
    friday: "שישי",
    saturday: "שבת"
  }

  const formatDays = (days?: string[]) => {
    if (!days || days.length === 0) return "-"
    return days.map(d => daysMap[d.toLowerCase()] || d).join(", ")
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch teacher data and expenses in parallel
        const [teacherRes, expensesRes] = await Promise.all([
          fetch(`/api/teachers/${id}?include=1`, { cache: "no-store" }),
          fetch(`/api/expenses?teacherId=${id}`, { cache: "no-store" })
        ])
        
        if (!teacherRes.ok) throw new Error(`Failed to load teacher (${teacherRes.status})`)

        const data = (await teacherRes.json()) as Teacher | null
        const expensesData = expensesRes.ok ? await expensesRes.json() : []
        
        if (!cancelled) {
          setTeacher(data)
          setTeacherExpenses(Array.isArray(expensesData) ? expensesData : [])
          setPayments(data?.payments ?? []) // Initialize payments state
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

  // Teacher payments are expenses for the center (paying the teacher for their work)
  const handleAddPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    if (paymentMethod === "credit" && cardLastDigits.length !== 4) return
    if ((paymentMethod === "transfer" || paymentMethod === "check") && (!bankName || !bankBranch || !accountNumber)) return

    setIsAddingPayment(true)
    try {
      // Save as expense since paying a teacher is an expense for the center
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          date: paymentDate,
          paymentMethod,
          description: paymentDescription || `תשלום למורה ${teacher?.name}`,
          category: "משכורת מורה",
          teacherId: id,
        }),
      })

      if (res.ok) {
        // Reset form and close dialog
        setPaymentAmount("")
        setPaymentMethod("cash")
        setPaymentDescription("")
        setPaymentDate(new Date().toISOString().split("T")[0])
        setCardLastDigits("")
        setBankName("")
        setBankBranch("")
        setAccountNumber("")
        setIsPaymentDialogOpen(false)
        // Refresh page to get updated data
        window.location.reload()
      }
    } catch (err) {
      console.error("Failed to add expense:", err)
    } finally {
      setIsAddingPayment(false)
    }
  }

  // Handle adding attendance record for teacher
  const handleAddAttendance = async () => {
    if (!attendanceDate || !attendanceHours || Number(attendanceHours) <= 0) return

    setIsAddingAttendance(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: id,
          courseId: attendanceCourseId || null,
          date: attendanceDate,
          hours: Number(attendanceHours),
          status: attendanceStatus,
          note: attendanceNote || null,
        }),
      })

      if (res.ok) {
        // Reset form and close dialog
        setAttendanceDate(new Date().toISOString().split("T")[0])
        setAttendanceHours("")
        setAttendanceStatus("נוכח")
        setAttendanceCourseId("")
        setAttendanceNote("")
        setIsAttendanceDialogOpen(false)
        // Refresh page to get updated data
        window.location.reload()
      }
    } catch (err) {
      console.error("Failed to add attendance:", err)
    } finally {
      setIsAddingAttendance(false)
    }
  }

  const courses = useMemo(() => teacher?.teacherCourses?.map((x) => x.course) ?? [], [teacher])
  const attendance = useMemo(() => teacher?.attendance ?? [], [teacher])

  // Calculate total paid to teacher from expenses
  const paidSum = useMemo(
    () => teacherExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0),
    [teacherExpenses],
  )
  
  // Calculate pending/owed amount based on hours worked and rates
  // For now, just show what's been paid - pending can be calculated from attendance * rate
  const pendingSum = useMemo(() => {
    const hourlyRate = teacher?.centerHourlyRate || 0
    const hoursWorked = attendance.reduce((s, a) => s + (a.hours ?? 0), 0)
    const owedAmount = hoursWorked * hourlyRate
    return Math.max(0, owedAmount - paidSum)
  }, [attendance, teacher?.centerHourlyRate, paidSum])
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
    <div dir="rtl" className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-transparent hover:bg-white/50">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{teacher.name}</div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {teacher.email ?? "-"}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {teacher.phone ?? "-"}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Edit className="h-4 w-4" />
            ערוך
          </Button>
        </Link>
      </div>

      <Card className="p-4 border-0 shadow-sm bg-white/50 dark:bg-card/50">
        <Tabs defaultValue="general" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md transition-all">כללי</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md transition-all">קורסים</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md transition-all">תשלומים</TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md transition-all">נוכחות</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-muted-foreground mb-1">תעודת זהות</div>
                <div className="font-semibold text-sm">{teacher.idNumber ?? "-"}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-muted-foreground mb-1">תאריך לידה</div>
                <div className="font-semibold text-sm">{fmtDate(teacher.birthDate)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-muted-foreground mb-1">עיר</div>
                <div className="font-semibold text-sm">{teacher.city ?? "-"}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-muted-foreground mb-1">התמחות</div>
                <div className="font-semibold text-sm">{teacher.specialty ?? "-"}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-muted-foreground mb-1">סטטוס</div>
                <div className="font-semibold text-sm">{teacher.status ?? "-"}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-muted-foreground mb-1">נוצר</div>
                <div className="font-semibold text-sm">{fmtDate(teacher.createdAt)}</div>
              </div>
            </div>

            {teacher.bio && (
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">אודות</div>
                <div className="text-sm">{teacher.bio}</div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
              <div className="text-xs text-green-600 dark:text-green-400 mb-2">תעריפים</div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">מחיר שעה במרכז</div>
                  <div className="font-semibold text-green-700 dark:text-green-400">{teacher.centerHourlyRate ?? 0} ₪</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">נסיעות</div>
                  <div className="font-semibold text-green-700 dark:text-green-400">{teacher.travelRate ?? 0} ₪</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">מחיר שעה בקורס חיצוני</div>
                  <div className="font-semibold text-green-700 dark:text-green-400">{teacher.externalCourseRate ?? 0} ₪</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">קורסים משויכים ({courses.length})</h4>
            </div>

            {courses.length ? (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-right p-3 font-medium">שם הקורס</th>
                      <th className="text-right p-3 font-medium">ימים</th>
                      <th className="text-right p-3 font-medium">שעות</th>
                      <th className="text-right p-3 font-medium">תלמידים</th>
                      <th className="text-right p-3 font-medium">ת. התחלה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr 
                        key={c.id} 
                        className="border-t hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors"
                        onClick={() => openCourseDialog(c)}
                      >
                        <td className="p-3 font-medium text-blue-700 dark:text-blue-400">{c.name}</td>
                        <td className="p-3 text-muted-foreground">{formatDays(c.daysOfWeek)}</td>
                        <td className="p-3 text-muted-foreground">{c.startTime && c.endTime ? `${c.startTime}-${c.endTime}` : "-"}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {c.enrollmentCount || 0}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{fmtDate(c.startDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground rounded-lg bg-slate-50 dark:bg-slate-900/50 border">
                אין קורסים משויכים למורה
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">₪</span>
                    <span className="text-xs text-red-700 dark:text-red-400">שולם למורה</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{paidSum.toLocaleString("he-IL")} ₪</div>
              </Card>
              <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600 font-bold">₪</span>
                  <span className="text-xs text-orange-700 dark:text-orange-400">חוב למורה</span>
                </div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{pendingSum.toLocaleString("he-IL")} ₪</div>
              </Card>
              <Card className={`p-4 ${pendingSum <= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-blue-50 dark:bg-blue-950/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold ${pendingSum <= 0 ? "text-green-600" : "text-blue-600"}`}>₪</span>
                  <span className={`text-xs ${pendingSum <= 0 ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>סה״כ הוצאות</span>
                </div>
                <div className={`text-2xl font-bold ${pendingSum <= 0 ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>
                  {paidSum.toLocaleString("he-IL")} ₪
                </div>
              </Card>
            </div>

            {teacherExpenses.length ? (
              <div className="space-y-3">
                {teacherExpenses.map((e) => (
                  <Card key={e.id} className="p-4 border-red-100 dark:border-red-900">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">{fmtDate(e.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {e.paymentMethod ? `אמצעי תשלום: ${e.paymentMethod === "cash" ? "מזומן" : e.paymentMethod === "transfer" ? "העברה" : e.paymentMethod === "check" ? "שיק" : e.paymentMethod === "bit" ? "ביט" : e.paymentMethod}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-red-600">{Number(e.amount).toLocaleString("he-IL")} ₪</div>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          הוצאה
                        </span>
                      </div>
                    </div>
                    {e.description ? <div className="text-sm text-muted-foreground mt-2">{e.description}</div> : null}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">אין תשלומים למורה</Card>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="mt-6 space-y-4">
            {/* Add Attendance Button */}
            <Button 
              className="w-full"
              onClick={() => setIsAttendanceDialogOpen(true)}
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף נוכחות
            </Button>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CalendarCheck className="h-4 w-4" />
                  נוכחות
                </div>
                <div className="text-2xl font-bold">{attendancePct}%</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CalendarCheck className="h-4 w-4" />
                  מפגשים
                </div>
                <div className="text-2xl font-bold">
                  {presentCount}/{totalCount}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>תשלום למורה (הוצאה)</DialogTitle>
            <DialogDescription>הזן את פרטי התשלום למורה - יירשם כהוצאה במערכת</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">סכום *</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">תאריך</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">אמצעי תשלום</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">מזומן</SelectItem>
                  <SelectItem value="credit">אשראי</SelectItem>
                  <SelectItem value="transfer">העברה בנקאית</SelectItem>
                  <SelectItem value="check">שיק</SelectItem>
                  <SelectItem value="bit">ביט</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "credit" && (
              <div className="space-y-2">
                <Label htmlFor="card-digits">4 ספרות אחרונות של כרטיס *</Label>
                <Input
                  id="card-digits"
                  placeholder="1234"
                  maxLength={4}
                  value={cardLastDigits}
                  onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            )}

            {(paymentMethod === "transfer" || paymentMethod === "check") && (
              <div className="grid gap-3 grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">בנק *</Label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger id="bank-name">
                      <SelectValue placeholder="בחר בנק" />
                    </SelectTrigger>
                    <SelectContent>
                      {israeliBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-branch">סניף *</Label>
                  <Input
                    id="bank-branch"
                    placeholder="מספר סניף"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">מס' חשבון *</Label>
                  <Input
                    id="account-number"
                    placeholder="מספר חשבון"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment-description">תיאור</Label>
              <Input
                id="payment-description"
                placeholder="תיאור התשלום (אופציונלי)"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleAddPayment}
              disabled={isAddingPayment || !paymentAmount || Number(paymentAmount) <= 0}
            >
              {isAddingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  מוסיף...
                </>
              ) : (
                "שלם למורה"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-700 dark:text-blue-400">{selectedCourse?.name}</DialogTitle>
            <DialogDescription>פרטי הקורס</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-muted-foreground mb-1">ימים</div>
                  <div className="font-semibold text-sm">{formatDays(selectedCourse.daysOfWeek)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-muted-foreground mb-1">שעות</div>
                  <div className="font-semibold text-sm">
                    {selectedCourse.startTime && selectedCourse.endTime ? `${selectedCourse.startTime} - ${selectedCourse.endTime}` : "-"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-muted-foreground mb-1">תאריך התחלה</div>
                  <div className="font-semibold text-sm">{fmtDate(selectedCourse.startDate)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-muted-foreground mb-1">תאריך סיום</div>
                  <div className="font-semibold text-sm">{fmtDate(selectedCourse.endDate)}</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-xs text-green-600 mb-1">תלמידים רשומים</div>
                  <div className="font-semibold text-lg text-green-700 dark:text-green-400">{selectedCourse.enrollmentCount || 0}</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-xs text-blue-600 mb-1">מחיר</div>
                  <div className="font-semibold text-lg text-blue-700 dark:text-blue-400">{selectedCourse.price?.toLocaleString("he-IL") || 0} ₪</div>
                </div>
              </div>
              
              {selectedCourse.location && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-muted-foreground mb-1">מיקום</div>
                  <div className="font-semibold text-sm">{selectedCourse.location}</div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                  onClick={() => setIsCourseDialogOpen(false)}
                >
                  סגור
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setIsCourseDialogOpen(false)
                    router.push(`/dashboard/courses/${selectedCourse.id}`)
                  }}
                >
                  צפה בקורס
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת נוכחות למורה</DialogTitle>
            <DialogDescription>רשום את שעות העבודה של המורה</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-date">תאריך *</Label>
              <Input
                id="attendance-date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance-hours">מספר שעות *</Label>
              <Input
                id="attendance-hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={attendanceHours}
                onChange={(e) => setAttendanceHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance-status">סטטוס</Label>
              <Select value={attendanceStatus} onValueChange={(v: "נוכח" | "חיסור" | "איחור") => setAttendanceStatus(v)}>
                <SelectTrigger id="attendance-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="נוכח">נוכח</SelectItem>
                  <SelectItem value="חיסור">חיסור</SelectItem>
                  <SelectItem value="איחור">איחור</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {courses.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="attendance-course">קורס (אופציונלי)</Label>
                <Select value={attendanceCourseId} onValueChange={setAttendanceCourseId}>
                  <SelectTrigger id="attendance-course">
                    <SelectValue placeholder="בחר קורס" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="attendance-note">הערה (אופציונלי)</Label>
              <Input
                id="attendance-note"
                placeholder="הערה לנוכחות"
                value={attendanceNote}
                onChange={(e) => setAttendanceNote(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleAddAttendance}
              disabled={isAddingAttendance || !attendanceDate || !attendanceHours || Number(attendanceHours) <= 0}
            >
              {isAddingAttendance ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  מוסיף...
                </>
              ) : (
                "הוסף נוכחות"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
