"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Plus, Trash2, TrendingUp, TrendingDown, Calendar, CreditCard, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  isRecurring: boolean
  recurringDay?: number
  category: string
  paymentMethod: "cash" | "credit" | "transfer" | "check" | "bit"
  cardLastDigits?: string
  bankName?: string
  bankBranch?: string
  accountNumber?: string
}

interface Payment {
  id: string
  amount: number
  date: string
  paymentMethod: string
  description?: string
  studentId?: string
  schoolId?: string
  student?: { id: string; firstName: string; lastName: string }
  school?: { id: string; name: string }
}

interface Student {
  id: string
  firstName: string
  lastName: string
}

interface School {
  id: string
  name: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CashierPage() {
  const router = useRouter()
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month" | "quarter" | "year">("month")
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isAddingIncome, setIsAddingIncome] = useState(false)

  // Expense form state
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0])
  const [expenseCategory, setExpenseCategory] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState("1")
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<"cash" | "credit" | "transfer" | "check" | "bit">("cash")
  const [expenseCardLastDigits, setExpenseCardLastDigits] = useState("")
  const [expenseBankName, setExpenseBankName] = useState("")
  const [expenseBankBranch, setExpenseBankBranch] = useState("")
  const [expenseAccountNumber, setExpenseAccountNumber] = useState("")

  // Income form state
  const [incomeDescription, setIncomeDescription] = useState("")
  const [incomeAmount, setIncomeAmount] = useState("")
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split("T")[0])
  const [incomeType, setIncomeType] = useState<"student" | "school" | "other">("student")
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedSchoolId, setSelectedSchoolId] = useState("")
  const [customName, setCustomName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "transfer" | "check" | "bit">("cash")
  const [cardLastDigits, setCardLastDigits] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankBranch, setBankBranch] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  // Fetch data from API
  const { data: expenses = [], isLoading: expensesLoading } = useSWR<Expense[]>("/api/expenses", fetcher)
  const { data: payments = [], isLoading: paymentsLoading } = useSWR<Payment[]>("/api/payments", fetcher)
  const { data: students = [] } = useSWR<Student[]>("/api/students", fetcher)
  const { data: schools = [] } = useSWR<School[]>("/api/schools", fetcher)

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

  const addExpense = async () => {
    if (!expenseDescription || !expenseAmount || !expenseCategory) return
    if (expensePaymentMethod === "credit" && !expenseCardLastDigits) return
    if ((expensePaymentMethod === "transfer" || expensePaymentMethod === "check") && (!expenseBankName || !expenseBankBranch || !expenseAccountNumber)) return

    setIsAddingExpense(true)
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: expenseDescription,
          amount: Number.parseFloat(expenseAmount),
          date: expenseDate,
          isRecurring,
          recurringDay: isRecurring ? Number.parseInt(recurringDay) : null,
          category: expenseCategory,
          paymentMethod: expensePaymentMethod,
        }),
      })

      if (response.ok) {
        mutate("/api/expenses")
        // Reset form
        setExpenseDescription("")
        setExpenseAmount("")
        setExpenseDate(new Date().toISOString().split("T")[0])
        setExpenseCategory("")
        setIsRecurring(false)
        setRecurringDay("1")
        setExpensePaymentMethod("cash")
        setExpenseCardLastDigits("")
        setExpenseBankName("")
        setExpenseBankBranch("")
        setExpenseAccountNumber("")
      }
    } catch (error) {
      console.error("Failed to add expense:", error)
    }
    setIsAddingExpense(false)
  }

  const addIncome = async () => {
    if (!incomeDescription || !incomeAmount) return

    let studentId = null
    let schoolId = null

    if (incomeType === "student" && selectedStudentId) {
      studentId = selectedStudentId
    } else if (incomeType === "school" && selectedSchoolId) {
      schoolId = selectedSchoolId
    } else if (incomeType === "other" && !customName) {
      return
    }

    if (paymentMethod === "credit" && !cardLastDigits) return
    if ((paymentMethod === "transfer" || paymentMethod === "check") && (!bankName || !bankBranch || !accountNumber)) return

    setIsAddingIncome(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(incomeAmount),
          date: incomeDate,
          paymentMethod,
          description: incomeDescription,
          studentId,
          schoolId,
        }),
      })

      if (response.ok) {
        mutate("/api/payments")
        // Reset form
        setIncomeDescription("")
        setIncomeAmount("")
        setIncomeDate(new Date().toISOString().split("T")[0])
        setIncomeType("student")
        setSelectedStudentId("")
        setSelectedSchoolId("")
        setCustomName("")
        setPaymentMethod("cash")
        setCardLastDigits("")
        setBankName("")
        setBankBranch("")
        setAccountNumber("")
      }
    } catch (error) {
      console.error("Failed to add income:", error)
    }
    setIsAddingIncome(false)
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate("/api/expenses")
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    }
  }

  const deleteIncome = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate("/api/payments")
      }
    } catch (error) {
      console.error("Failed to delete income:", error)
    }
  }

  const filterByTimePeriod = <T extends { date: string }>(items: T[]): T[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return items.filter((item) => {
      const itemDate = new Date(item.date)

      switch (timePeriod) {
        case "day":
          return itemDate.toDateString() === today.toDateString()
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          return itemDate >= weekAgo && itemDate <= today
        case "month":
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3)
          const itemQuarter = Math.floor(itemDate.getMonth() / 3)
          return itemQuarter === quarter && itemDate.getFullYear() === now.getFullYear()
        case "year":
          return itemDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
  }

  const filteredExpenses = filterByTimePeriod(expenses)
  const filteredPayments = filterByTimePeriod(payments)

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalIncomes = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const balance = totalIncomes - totalExpenses

  const getTimePeriodLabel = (period: string) => {
    switch (period) {
      case "day": return "יום"
      case "week": return "שבוע"
      case "month": return "חודש"
      case "quarter": return "רבעון"
      case "year": return "שנה"
      default: return period
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash": return "מזומן"
      case "credit": return "אשראי"
      case "transfer": return "העברה בנקאית"
      case "check": return "שיק"
      case "bit": return "ביט"
      default: return method
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "rent": return "שכירות"
      case "salary": return "שכר"
      case "utilities": return "חשמל ומים"
      case "equipment": return "ציוד"
      case "maintenance": return "תחזוקה"
      case "other": return "אחר"
      default: return category
    }
  }

  const getTotalByPaymentMethod = (method: "cash" | "credit" | "transfer" | "check" | "bit") => {
    const incomeTotal = filteredPayments
      .filter((p) => p.paymentMethod === method)
      .reduce((sum, p) => sum + Number(p.amount), 0)
    const expenseTotal = filteredExpenses
      .filter((e) => e.paymentMethod === method)
      .reduce((sum, e) => sum + Number(e.amount), 0)
    return incomeTotal - expenseTotal
  }

  if (expensesLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">הכנסות והוצאות</h1>
          <p className="text-muted-foreground">ניהול תקציב ומעקב פיננסי</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">יום</SelectItem>
              <SelectItem value="week">שבוע</SelectItem>
              <SelectItem value="month">חודש</SelectItem>
              <SelectItem value="quarter">רבעון</SelectItem>
              <SelectItem value="year">שנה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-green-700">
              <TrendingUp className="h-4 w-4" />
              סך הכנסות
            </CardTitle>
            <CardDescription className="text-xs text-green-600">
              ב{getTimePeriodLabel(timePeriod)} הנוכחי
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">₪{totalIncomes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <TrendingDown className="h-4 w-4" />
              סך הוצאות
            </CardTitle>
            <CardDescription className="text-xs text-red-600">ב{getTimePeriodLabel(timePeriod)} הנוכחי</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">₪{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className={balance >= 0 ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-base ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>יתרה</CardTitle>
            <CardDescription className={`text-xs ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              ב{getTimePeriodLabel(timePeriod)} הנוכחי
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              ₪{balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="mb-6 grid gap-3 md:grid-cols-5">
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-purple-700">
              <CreditCard className="h-4 w-4" />
              מזומן
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-700">₪{getTotalByPaymentMethod("cash").toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-indigo-700">
              <CreditCard className="h-4 w-4" />
              אשראי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-indigo-700">₪{getTotalByPaymentMethod("credit").toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-cyan-700">
              <CreditCard className="h-4 w-4" />
              העברה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-cyan-700">₪{getTotalByPaymentMethod("transfer").toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-teal-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-teal-700">
              <CreditCard className="h-4 w-4" />
              שיק
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-teal-700">₪{getTotalByPaymentMethod("check").toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-700">
              <CreditCard className="h-4 w-4" />
              ביט
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-700">₪{getTotalByPaymentMethod("bit").toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">הוצאות</TabsTrigger>
          <TabsTrigger value="incomes">הכנסות</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                הוספת הוצאה חדשה
              </CardTitle>
              <CardDescription>הוסף הוצאה חד-פעמית או קבועה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expense-description">תיאור ההוצאה *</Label>
                  <Input
                    id="expense-description"
                    placeholder="לדוגמה: שכר משרד, חשמל, ציוד..."
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount">סכום *</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-category">קטגוריה *</Label>
                  <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                    <SelectTrigger id="expense-category">
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">שכירות</SelectItem>
                      <SelectItem value="salary">שכר</SelectItem>
                      <SelectItem value="utilities">חשמל ומים</SelectItem>
                      <SelectItem value="equipment">ציוד</SelectItem>
                      <SelectItem value="maintenance">תחזוקה</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-date">תאריך</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-payment-method">אופן תשלום *</Label>
                <Select value={expensePaymentMethod} onValueChange={(value: any) => setExpensePaymentMethod(value)}>
                  <SelectTrigger id="expense-payment-method">
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

              {expensePaymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label htmlFor="expense-card-digits">4 ספרות אחרונות של הכרטיס *</Label>
                  <Input
                    id="expense-card-digits"
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={expenseCardLastDigits}
                    onChange={(e) => setExpenseCardLastDigits(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              )}

              {(expensePaymentMethod === "transfer" || expensePaymentMethod === "check") && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="expense-bank-name">שם הבנק *</Label>
                    <Select value={expenseBankName} onValueChange={setExpenseBankName}>
                      <SelectTrigger id="expense-bank-name">
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
                    <Label htmlFor="expense-bank-branch">סניף *</Label>
                    <Input
                      id="expense-bank-branch"
                      type="text"
                      placeholder="מס׳ סניף"
                      value={expenseBankBranch}
                      onChange={(e) => setExpenseBankBranch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-account-number">מס׳ חשבון *</Label>
                    <Input
                      id="expense-account-number"
                      type="text"
                      placeholder="מס׳ חשבון"
                      value={expenseAccountNumber}
                      onChange={(e) => setExpenseAccountNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  הוצאה קבועה (חודשית)
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurring-day">יום בחודש לחיוב</Label>
                  <Select value={recurringDay} onValueChange={setRecurringDay}>
                    <SelectTrigger id="recurring-day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={addExpense} className="w-full bg-red-600 hover:bg-red-700" disabled={isAddingExpense}>
                {isAddingExpense ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                הוסף הוצאה
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>רשימת הוצאות</CardTitle>
              <CardDescription>הוצאות ב{getTimePeriodLabel(timePeriod)} הנוכחי</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  לא נרשמו הוצאות ב{getTimePeriodLabel(timePeriod)} הנוכחי
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">תיאור</TableHead>
                      <TableHead className="text-right">קטגוריה</TableHead>
                      <TableHead className="text-right">סכום</TableHead>
                      <TableHead className="text-right">תאריך</TableHead>
                      <TableHead className="text-right">סוג</TableHead>
                      <TableHead className="text-right">אופן תשלום</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                        <TableCell className="text-red-600 font-semibold">₪{Number(expense.amount).toLocaleString()}</TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString("he-IL")}</TableCell>
                        <TableCell>
                          {expense.isRecurring ? (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              קבוע - יום {expense.recurringDay}
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">חד פעמי</span>
                          )}
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(expense.paymentMethod)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                הוספת הכנסה חדשה
              </CardTitle>
              <CardDescription>רשום הכנסה מתלמיד, בית ספר או מקור אחר</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="income-type">סוג ההכנסה *</Label>
                  <Select
                    value={incomeType}
                    onValueChange={(value: any) => {
                      setIncomeType(value)
                      setSelectedStudentId("")
                      setSelectedSchoolId("")
                      setCustomName("")
                    }}
                  >
                    <SelectTrigger id="income-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">תלמיד</SelectItem>
                      <SelectItem value="school">בית ספר</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {incomeType === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="student-select">בחר תלמיד *</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student-select">
                        <SelectValue placeholder="בחר תלמיד מהרשימה" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.length === 0 ? (
                          <SelectItem value="none" disabled>
                            אין תלמידים במערכת
                          </SelectItem>
                        ) : (
                          students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {incomeType === "school" && (
                  <div className="space-y-2">
                    <Label htmlFor="school-select">בחר בית ספר *</Label>
                    <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                      <SelectTrigger id="school-select">
                        <SelectValue placeholder="בחר בית ספר מהרשימה" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.length === 0 ? (
                          <SelectItem value="none" disabled>
                            אין בתי ספר במערכת
                          </SelectItem>
                        ) : (
                          schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {incomeType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-name">שם המקור *</Label>
                    <Input
                      id="custom-name"
                      placeholder="הזן שם..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="income-description">תיאור *</Label>
                  <Input
                    id="income-description"
                    placeholder="לדוגמה: תשלום עבור קורס רובוטיקה..."
                    value={incomeDescription}
                    onChange={(e) => setIncomeDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income-amount">סכום *</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    placeholder="0.00"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income-date">תאריך</Label>
                  <Input
                    id="income-date"
                    type="date"
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">אופן תשלום *</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
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
                <div className="grid gap-4 md:grid-cols-3">
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
                    <Label htmlFor="account-number">מס׳ חשבון *</Label>
                    <Input
                      id="account-number"
                      placeholder="מספר חשבון"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button onClick={addIncome} className="w-full bg-green-600 hover:bg-green-700" disabled={isAddingIncome}>
                {isAddingIncome ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                הוסף הכנסה
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>רשימת הכנסות</CardTitle>
              <CardDescription>הכנסות ב{getTimePeriodLabel(timePeriod)} הנוכחי</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  לא נרשמו הכנסות ב{getTimePeriodLabel(timePeriod)} הנוכחי
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">תיאור</TableHead>
                      <TableHead className="text-right">מקור</TableHead>
                      <TableHead className="text-right">אופן תשלום</TableHead>
                      <TableHead className="text-right">סכום</TableHead>
                      <TableHead className="text-right">תאריך</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.description || "-"}</TableCell>
                        <TableCell>
                          {payment.student
                            ? `${payment.student.firstName} ${payment.student.lastName}`
                            : payment.school
                            ? payment.school.name
                            : "-"}
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                        <TableCell className="text-green-600 font-semibold">₪{Number(payment.amount).toLocaleString()}</TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString("he-IL")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => deleteIncome(payment.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
