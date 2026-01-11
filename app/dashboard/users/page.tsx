"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  UserPlus,
  Edit,
  Trash2,
  Power,
  Lock,
  BookOpen,
  GraduationCap,
  School,
  User as UserIcon,
  FileText,
  Rocket,
  BarChart,
  DollarSign,
  Calendar,
  ClipboardCheck,
  Settings,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PERMISSION_CATEGORIES, type PermissionCategory } from "@/lib/permissions"

type User = {
  id: string
  name: string
  email: string
  phone?: string | null
  status: "active" | "disabled"
  permissions?: string[]
  createdAt: string
}

const categoryIcons: Record<string, any> = {
  courses: BookOpen,
  students: GraduationCap,
  schools: School,
  teachers: UserIcon,
  registration: FileText,
  gafan: Rocket,
  reports: BarChart,
  cashier: DollarSign,
  schedule: Calendar,
  attendance: ClipboardCheck,
  settings: Settings,
  users: Users,
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200",
  pink: "bg-pink-50 border-pink-200",
  orange: "bg-orange-50 border-orange-200",
  green: "bg-green-50 border-green-200",
  cyan: "bg-cyan-50 border-cyan-200",
  rose: "bg-rose-50 border-rose-200",
  yellow: "bg-yellow-50 border-yellow-200",
  emerald: "bg-emerald-50 border-emerald-200",
  sky: "bg-sky-50 border-sky-200",
  purple: "bg-purple-50 border-purple-200",
  slate: "bg-slate-50 border-slate-200",
  indigo: "bg-indigo-50 border-indigo-200",
}

export default function UsersPage() {
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<"__all__" | "active" | "disabled">("__all__")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [pendingAction, setPendingAction] = useState<{ type: "edit" | "toggle" | "delete"; user: User } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const isAdminUser = (u: User) => u.email === "admin@test.com"

  async function loadUsers() {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (statusFilter !== "__all__") params.set("status", statusFilter)

    const res = await fetch(`/api/users?${params.toString()}`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to load users")
    const data = (await res.json()) as User[]
    setUsers(data)
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        await loadUsers()
      } catch (e) {
        console.error(e)
        alert("שגיאה בטעינת משתמשים")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      loadUsers().catch((e) => console.error(e))
    }, 350)
    return () => clearTimeout(t)
  }, [q, statusFilter])

  function resetForm() {
    setFormData({ name: "", email: "", phone: "" })
    setSelectedPermissions([])
    setEditingUser(null)
  }

  function openCreate() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    })
    setSelectedPermissions(user.permissions || [])
    setIsDialogOpen(true)
  }

  async function createUser() {
    const name = formData.name.trim()
    const email = formData.email.trim()
    if (!name || !email) {
      alert("יש למלא שם ואימייל")
      return
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: formData.phone.trim() || null,
        permissions: selectedPermissions,
        status: "active",
      }),
    })

    if (res.status === 409) {
      alert("האימייל כבר קיים")
      return
    }
    if (!res.ok) {
      alert("שגיאה ביצירת משתמש")
      return
    }

    setIsDialogOpen(false)
    resetForm()
    await loadUsers()
  }

  async function updateUser(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formData.phone.trim() || null,
        permissions: selectedPermissions,
      }),
    })

    if (!res.ok) {
      alert("שגיאה בעדכון משתמש")
      return
    }

    setIsDialogOpen(false)
    resetForm()
    await loadUsers()
  }

  async function toggleUser(user: User) {
    const nextStatus = user.status === "active" ? "disabled" : "active"

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!res.ok) {
      alert("שגיאה בעדכון סטטוס משתמש")
      return
    }
    await loadUsers()
  }

  async function deleteUser(user: User) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      alert("שגיאה במחיקת משתמש")
      return
    }
    await loadUsers()
  }

  function requireAdminPassword(action: { type: "edit" | "toggle" | "delete"; user: User }) {
    setPendingAction(action)
    setIsPasswordDialogOpen(true)
  }

  function verifySuperAdminPassword() {
    if (passwordInput === "admin123") {
      setIsPasswordDialogOpen(false)
      setPasswordInput("")

      if (pendingAction) {
        if (pendingAction.type === "edit") openEdit(pendingAction.user)
        if (pendingAction.type === "toggle") toggleUser(pendingAction.user).catch(console.error)
        if (pendingAction.type === "delete") deleteUser(pendingAction.user).catch(console.error)
      }
      setPendingAction(null)
    } else {
      alert("סיסמה שגויה")
      setPasswordInput("")
    }
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((p) => p !== permissionId) : [...prev, permissionId]
    )
  }

  function toggleCategoryAll(category: PermissionCategory) {
    const categoryPermissionIds = category.permissions.map((p) => p.id)
    const allSelected = categoryPermissionIds.every((id) => selectedPermissions.includes(id))

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryPermissionIds.includes(p)))
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...categoryPermissionIds])])
    }
  }

  const filteredCount = useMemo(() => users.length, [users])

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה
            </button>
            <h1 className="text-3xl font-bold text-gray-900">משתמשים</h1>
            <p className="text-gray-600">ניהול משתמשים והרשאות (DB)</p>
          </div>

          <Button className="gap-2" onClick={openCreate}>
            <UserPlus className="h-4 w-4" />
            הוסף משתמש
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">סינון וחיפוש</CardTitle>
            <CardDescription>חיפוש לפי שם/אימייל/טלפון וסינון לפי סטטוס</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>חיפוש</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חפש משתמש..." />
            </div>

            <div className="w-full md:w-64 space-y-2">
              <Label>סטטוס</Label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="הכל" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">הכל</SelectItem>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="disabled">מושבת</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600 pt-2 md:pt-0">
              {loading ? "טוען..." : `${filteredCount} משתמשים`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>רשימת משתמשים</CardTitle>
            <CardDescription>עריכה: טלפון + הרשאות | פעולה: השבת/הפעל/מחק</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-gray-500">טוען...</div>
            ) : users.length === 0 ? (
              <div className="py-10 text-center text-gray-500">אין משתמשים</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>טלפון</TableHead>
                    <TableHead>הרשאות</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>נוצר</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isAdminUser(u) && <Lock className="h-4 w-4 text-purple-600" />}
                          {u.name}
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.permissions?.length || 0} הרשאות</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={u.status === "active" ? "bg-emerald-600 text-white" : "bg-gray-400 text-white"}
                        >
                          {u.status === "active" ? "פעיל" : "מושבת"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString("he-IL")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={isAdminUser(u) ? "דורש אימות" : "ערוך"}
                            onClick={() =>
                              isAdminUser(u) ? requireAdminPassword({ type: "edit", user: u }) : openEdit(u)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title={u.status === "active" ? "השבת" : "הפעל"}
                            onClick={() =>
                              isAdminUser(u)
                                ? requireAdminPassword({ type: "toggle", user: u })
                                : toggleUser(u).catch(console.error)
                            }
                          >
                            {u.status === "active" ? (
                              <Power className="h-4 w-4 text-orange-600" />
                            ) : (
                              <Power className="h-4 w-4 text-emerald-600" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="מחק"
                            onClick={() =>
                              isAdminUser(u)
                                ? requireAdminPassword({ type: "delete", user: u })
                                : deleteUser(u).catch(console.error)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingUser ? "עריכת משתמש" : "משתמש חדש"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "הגדר את פרטי המשתמש והרשאותיו במערכת" : "יצירת משתמש חדש (שם + אימייל חובה)"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>שם מלא *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    disabled={!!editingUser}
                    placeholder="הזן שם מלא"
                  />
                </div>

                <div className="space-y-2">
                  <Label>אימייל *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    disabled={!!editingUser}
                    placeholder="example@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>טלפון</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="מספר טלפון"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">הרשאות</Label>
                  <Badge variant="outline">{selectedPermissions.length} הרשאות נבחרו</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {PERMISSION_CATEGORIES.map((category) => {
                    const Icon = categoryIcons[category.id]
                    const allSelected = category.permissions.every((p) => selectedPermissions.includes(p.id))

                    return (
                      <Card
                        key={category.id}
                        className={`${colorClasses[category.color] || "bg-gray-50 border-gray-200"} border-2`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5" />
                              <CardTitle className="text-sm">{category.name}</CardTitle>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-xs cursor-pointer"
                              onClick={() => toggleCategoryAll(category)}
                            >
                              {allSelected ? "ביטול" : "הכל"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {category.permissions.map((perm) => (
                            <div key={perm.id} className="flex items-start gap-2">
                              <Checkbox
                                id={perm.id}
                                checked={selectedPermissions.includes(perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                              <div className="grid gap-1 leading-none">
                                <label htmlFor={perm.id} className="text-sm font-medium leading-none cursor-pointer">
                                  {perm.name}
                                </label>
                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => (editingUser ? updateUser(editingUser.id) : createUser())}
              >
                {editingUser ? "שמור שינויים" : "צור משתמש"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                אימות סיסמה
              </AlertDialogTitle>
              <AlertDialogDescription>פעולה על ADMIN מוגנת. הזן סיסמה כדי להמשיך.</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2 py-2">
              <Label>סיסמת ADMIN</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="admin123"
                onKeyDown={(e) => {
                  if (e.key === "Enter") verifySuperAdminPassword()
                }}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setPasswordInput("")
                  setPendingAction(null)
                }}
              >
                ביטול
              </AlertDialogCancel>
              <AlertDialogAction onClick={verifySuperAdminPassword}>אמת</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
