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
    "בנק יהב",
    "בנק ירושלים",
  ]

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

  const handleAddPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    if (paymentMethod === "credit" && cardLastDigits.length !== 4) return
    if ((paymentMethod === "transfer" || paymentMethod === "check") && (!bankName || !bankBranch || !accountNumber)) return

    setIsAddingPayment(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          date: paymentDate,
          paymentMethod,
          description: paymentDescription,
          teacherId: id,
          cardLastDigits: paymentMethod === "credit" ? cardLastDigits : undefined,
          bankName: (paymentMethod === "transfer" || paymentMethod === "check") ? bankName : undefined,
          bankBranch: (paymentMethod === "transfer" || paymentMethod === "check") ? bankBranch : undefined,
          accountNumber: (paymentMethod === "transfer" || paymentMethod === "check") ? accountNumber : undefined,
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
      console.error("Failed to add payment:", err)
    } finally {
      setIsAddingPayment(false)
    }
  }

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
              <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">₪</span>
                    <span className="text-xs text-green-700 dark:text-green-400">שולם</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{paidSum.toLocaleString("he-IL")} ₪</div>
              </Card>
              <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600 font-bold">₪</span>
                  <span className="text-xs text-orange-700 dark:text-orange-400">חיובים</span>
                </div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{pendingSum.toLocaleString("he-IL")} ₪</div>
              </Card>
              <Card className={`p-4 ${(paidSum - pendingSum) >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold ${(paidSum - pendingSum) >= 0 ? "text-green-600" : "text-red-600"}`}>₪</span>
                  <span className={`text-xs ${(paidSum - pendingSum) >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>יתרה</span>
                </div>
                <div className={`text-2xl font-bold ${(paidSum - pendingSum) >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {(paidSum - pendingSum).toLocaleString("he-IL")} ₪
                </div>
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
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
                "הוסף תשלום"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
