"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Receipt, CalendarCheck, Plus, Loader2 } from "lucide-react"

type Course = {
  id: string
  name: string
  duration?: number
}

type Enrollment = {
  id: string
  sessionsLeft?: number
  status: string
  joinedAt?: string
  enrollmentDate?: string
  courseName?: string
  coursePrice?: number | null
  course?: Course | null
}

type Payment = {
  id: string
  amount: number
  status?: "PAID" | "PENDING" | "CANCELED"
  paymentType?: string
  paymentDate?: string
  description?: string | null
}

type Attendance = {
  id: string
  date: string
  status: string
  courseName?: string | null
  courseDuration?: number | null
  courseId?: string
  note?: string | null
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

function paymentMethodHe(m?: string) {
  switch (m?.toLowerCase()) {
    case "cash":
      return "מזומן"
    case "credit":
      return "אשראי"
    case "transfer":
    case "bank_transfer":
      return "העברה בנקאית"
    case "check":
      return "שיק"
    case "bit":
      return "ביט"
    case "paybox":
      return "פייבוקס"
    default:
      return "מזומן"
  }
}

function attendanceStatusHe(s: string) {
  if (s === "present" || s === "PRESENT") return "נוכח"
  if (s === "absent" || s === "ABSENT") return "נעדר"
  if (s === "sick") return "חולה"
  if (s === "vacation") return "חופש"
  return s
}

export function StudentTabs({
  studentId,
  enrollments,
  payments,
  attendances,
  onPaymentAdded,
}: {
  studentId: string
  enrollments: Enrollment[]
  payments: Payment[]
  attendances: Attendance[]
  onPaymentAdded?: () => void
}) {
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
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const israeliBanks = [
    "בנק לאומי",
    "בנק הפועלים",
    "בנק דיסקונט",
    "בנק מזרחי טפחות",
    "בנק יהב",
    "בנק ירושלים",
    "בנק איגוד",
    "בנק מסד",
    "בנק אוצר החייל",
    "בנק דואר",
  ]

  const paymentsSummary = useMemo(() => {
    // Sum all payments (payments without status are considered paid)
    const paid = payments.reduce((sum, p) => {
      if (!p.status || p.status === "PAID") {
        return sum + Number(p.amount)
      }
      return sum
    }, 0)
    // Calculate total course costs (charges) from enrollments
    const charges = enrollments.reduce((sum, e) => sum + Number(e.coursePrice || 0), 0)
    // Balance = paid - charges (negative means owes money, positive means credit)
    const balance = paid - charges
    return { paid, charges, balance }
  }, [payments, enrollments])

  // Filter attendances by selected course
  const filteredAttendances = useMemo(() => {
    if (!selectedCourseId) return attendances
    return attendances.filter((a) => a.courseId === selectedCourseId)
  }, [attendances, selectedCourseId])

  // Calculate remaining sessions for a specific course
  const getRemainingSessions = (courseId: string, totalSessions: number) => {
    const presentCount = attendances.filter(
      (a) => a.courseId === courseId && (a.status === "present" || a.status === "PRESENT")
    ).length
    return Math.max(0, totalSessions - presentCount)
  }

  // Get selected course details from enrollment (flat structure)
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null
    const enrollment = enrollments.find((e: any) => e.courseId === selectedCourseId || e.courseIdRef === selectedCourseId)
    if (!enrollment) return null
    return {
      id: enrollment.courseId || enrollment.courseIdRef,
      name: enrollment.courseName,
      duration: enrollment.courseDuration,
      price: enrollment.coursePrice
    }
  }, [enrollments, selectedCourseId])

  const attendanceSummary = useMemo(() => {
    // Count present attendance records (filtered by course if selected)
    const present = filteredAttendances.filter((a) => a.status === "present" || a.status === "PRESENT").length
    
    // Calculate total sessions based on selected course or all courses
    let totalSessions: number
    if (selectedCourseId && selectedCourse) {
      totalSessions = selectedCourse.duration || 0
    } else {
      // Sum duration from all enrolled courses (flat structure from API)
      totalSessions = enrollments.reduce((sum, e: any) => {
        const courseDuration = e.courseDuration || 0
        return sum + courseDuration
      }, 0)
    }
    
    // Calculate remaining sessions (total - attended)
    const remaining = Math.max(0, totalSessions - present)
    
    // Calculate attendance percentage
    const percent = totalSessions === 0 ? 0 : Math.round((present / totalSessions) * 100)
    
    return { totalSessions, present, remaining, percent }
  }, [filteredAttendances, enrollments, selectedCourseId, selectedCourse])

  const handleAddPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    if (paymentMethod === "credit" && cardLastDigits.length !== 4) return
    if ((paymentMethod === "transfer" || paymentMethod === "check") && (!bankName || !bankBranch || !accountNumber)) return

    setIsAddingPayment(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          date: paymentDate,
          paymentMethod,
          description: paymentDescription,
          studentId,
          cardLastDigits: paymentMethod === "credit" ? cardLastDigits : undefined,
          bankName: (paymentMethod === "transfer" || paymentMethod === "check") ? bankName : undefined,
          bankBranch: (paymentMethod === "transfer" || paymentMethod === "check") ? bankBranch : undefined,
          accountNumber: (paymentMethod === "transfer" || paymentMethod === "check") ? accountNumber : undefined,
        }),
      })

      if (response.ok) {
        // Reset form
        setPaymentAmount("")
        setPaymentMethod("cash")
        setPaymentDescription("")
        setPaymentDate(new Date().toISOString().split("T")[0])
        setCardLastDigits("")
        setBankName("")
        setBankBranch("")
        setAccountNumber("")
        setIsPaymentDialogOpen(false)
        onPaymentAdded?.()
      }
    } catch (error) {
      console.error("Failed to add payment:", error)
    }
    setIsAddingPayment(false)
  }

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
            enrollments.map((enr) => {
              const courseId = enr.courseId || enr.courseIdRef
              const totalSessions = enr.courseDuration || 0
              const remainingSessions = getRemainingSessions(courseId, totalSessions)
              
              return (
                <Card key={enr.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h5 className="font-semibold text-foreground">{enr.courseName || "קורס לא ידוע"}</h5>
                      <div className="text-xs text-muted-foreground">
                        הצטרף: {formatDate(enr.enrollmentDate || enr.joinedAt)} · סטטוס: {enr.status === "active" ? "פעיל" : enr.status}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-400 mb-0.5">יתרת מפגשים</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{remainingSessions}</p>
                    </div>
                  </div>
                </Card>
              )
            })
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
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 relative">
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 left-2 h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>הוספת תשלום חדש</DialogTitle>
                  <DialogDescription>הזן את פרטי התשלום</DialogDescription>
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
                    <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
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
                    onClick={handleAddPayment}
                    disabled={isAddingPayment || !paymentAmount}
                    className="w-full"
                  >
                    {isAddingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        שומר...
                      </>
                    ) : (
                      "הוסף תשלום"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 font-bold">₪</span>
              <p className="text-xs text-green-700 dark:text-green-400">שולם</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{paymentsSummary.paid.toLocaleString()} ₪</p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-600 font-bold">₪</span>
              <p className="text-xs text-orange-700 dark:text-orange-400">חיובים</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{paymentsSummary.charges.toLocaleString()} ₪</p>
          </Card>

          <Card className={`p-4 ${paymentsSummary.balance >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-bold ${paymentsSummary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>₪</span>
              <p className={`text-xs ${paymentsSummary.balance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>יתרה</p>
            </div>
            <p className={`text-2xl font-bold ${paymentsSummary.balance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
              {paymentsSummary.balance.toLocaleString()} ₪
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">היסטוריית תשלומים</h4>

          {payments.length > 0 ? (
            payments.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{formatDate(p.paymentDate)}</div>
                    <div className="text-sm text-muted-foreground">שיטה: {paymentMethodHe(p.paymentType)}</div>
                    {p.description ? <div className="text-xs text-muted-foreground">הערה: {p.description}</div> : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{Number(p.amount).toLocaleString()} ₪</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                      שולם
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
        {/* Course Selection Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCourseId === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCourseId(null)}
            className={selectedCourseId === null ? "" : "bg-transparent"}
          >
            כל הקורסים
          </Button>
          {enrollments.map((enr: any) => {
            const courseId = enr.courseId || enr.courseIdRef
            return (
              <Button
                key={courseId || enr.id}
                variant={selectedCourseId === courseId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCourseId(courseId || null)}
                className={selectedCourseId === courseId ? "" : "bg-transparent"}
              >
                {enr.courseName || "קורס"}
              </Button>
            )
          })}
        </div>

        {/* Course Info Header */}
        {selectedCourse && (
          <Card className="p-4 bg-primary/5 border-primary/20 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-primary">{selectedCourse.name}</h4>
                <p className="text-sm text-muted-foreground">מספר מפגשים בקורס: {selectedCourse.duration || 0}</p>
              </div>
            </div>
          </Card>
        )}

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
              <p className="text-xs text-blue-700 dark:text-blue-400">מפגשים</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {attendanceSummary.present}/{attendanceSummary.totalSessions}
            </p>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-orange-700 dark:text-orange-400">יתרת מפגשים</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{attendanceSummary.remaining}</p>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">רשומות נוכחות</h4>

          {filteredAttendances.length > 0 ? (
            filteredAttendances.map((a) => {
              const isPresent = a.status === "present" || a.status === "PRESENT"
              const statusColor = isPresent
                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                : a.status === "sick"
                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400"
                  : a.status === "vacation"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
              
              return (
                <Card key={a.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{formatDateTime(a.date)}</div>
                      {!selectedCourseId && (
                        <div className="text-sm text-muted-foreground">
                          קורס: {a.courseName || "—"}
                        </div>
                      )}
                      {a.note ? <div className="text-xs text-muted-foreground">הערה: {a.note}</div> : null}
                    </div>

                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                      {attendanceStatusHe(a.status)}
                    </span>
                  </div>
                </Card>
              )
            })
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
