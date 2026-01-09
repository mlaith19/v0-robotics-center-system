"use client"

import { useState, useEffect } from "react"
import {
  ArrowRight,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Rocket,
  DollarSign,
  FileText,
  Calendar,
  SettingsIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

type UserRole = "תלמיד" | "מורה" | "מזכירה" | "חשבונאות" | "אחר" | "סופר אדמין"

type Permission = {
  id: string
  name: string
  description: string
}

type PermissionCategory = {
  id: string
  name: string
  icon: any
  permissions: Permission[]
  color: string
}

type User = {
  id: string
  name: string
  email: string
  username: string
  password: string
  role: UserRole
  permissions: string[]
  createdAt: string
}

const permissionCategories: PermissionCategory[] = [
  {
    id: "courses",
    name: "קורסים",
    icon: BookOpen,
    color: "bg-blue-50 border-blue-200",
    permissions: [
      { id: "courses-view", name: "צפייה בקורסים", description: "צפייה ברשימת קורסים" },
      { id: "courses-edit", name: "עריכת קורסים", description: "יצירה ועריכת קורסים" },
      { id: "courses-delete", name: "מחיקת קורסים", description: "מחיקת קורסים" },
    ],
  },
  {
    id: "students",
    name: "תלמידים",
    icon: GraduationCap,
    color: "bg-purple-50 border-purple-200",
    permissions: [
      { id: "students-view", name: "צפייה בתלמידים", description: "צפייה ברשימת תלמידים" },
      { id: "students-edit", name: "עריכת תלמידים", description: "יצירה ועריכת תלמידים" },
      { id: "students-delete", name: "מחיקת תלמידים", description: "מחיקת תלמידים" },
    ],
  },
  {
    id: "teachers",
    name: "מורים",
    icon: Users,
    color: "bg-green-50 border-green-200",
    permissions: [
      { id: "teachers-view", name: "צפייה במורים", description: "צפייה ברשימת מורים" },
      { id: "teachers-edit", name: "עריכת מורים", description: "יצירה ועריכת מורים" },
      { id: "teachers-delete", name: "מחיקת מורים", description: "מחיקת מורים" },
    ],
  },
  {
    id: "schools",
    name: "בתי ספר",
    icon: School,
    color: "bg-orange-50 border-orange-200",
    permissions: [
      { id: "schools-view", name: "צפייה בבתי ספר", description: "צפייה ברשימת בתי ספר" },
      { id: "schools-edit", name: "עריכת בתי ספר", description: "יצירה ועריכת בתי ספר" },
      { id: "schools-delete", name: "מחיקת בתי ספר", description: "מחיקת בתי ספר" },
    ],
  },
  {
    id: "gafan",
    name: 'תוכניות גפ"ן',
    icon: Rocket,
    color: "bg-pink-50 border-pink-200",
    permissions: [
      { id: "gafan-view", name: 'צפייה בתוכניות גפ"ן', description: 'צפייה ברשימת תוכניות גפ"ן' },
      { id: "gafan-edit", name: 'עריכת תוכניות גפ"ן', description: 'יצירה ועריכת תוכניות גפ"ן' },
      { id: "gafan-delete", name: 'מחיקת תוכניות גפ"ן', description: 'מחיקת תוכניות גפ"ן' },
    ],
  },
  {
    id: "registration",
    name: "רישום",
    icon: FileText,
    color: "bg-cyan-50 border-cyan-200",
    permissions: [
      { id: "registration-view", name: "צפייה ברישומים", description: "צפייה ברשימת רישומים" },
      { id: "registration-send", name: "שליחת טופס רישום", description: "שליחת טפסי רישום" },
    ],
  },
  {
    id: "cashier",
    name: "קופה",
    icon: DollarSign,
    color: "bg-emerald-50 border-emerald-200",
    permissions: [
      { id: "cashier-view", name: "צפייה בקופה", description: "צפייה בהכנסות והוצאות" },
      { id: "cashier-income", name: "הוספת הכנסה", description: "רישום הכנסות" },
      { id: "cashier-expense", name: "הוספת הוצאה", description: "רישום הוצאות" },
      { id: "cashier-delete", name: "מחיקת תנועות", description: "מחיקת הכנסות והוצאות" },
    ],
  },
  {
    id: "reports",
    name: "דוחות",
    icon: FileText,
    color: "bg-amber-50 border-amber-200",
    permissions: [
      { id: "reports-view", name: "צפייה בדוחות", description: "צפייה בדוחות" },
      { id: "reports-export", name: "ייצוא דוחות", description: "ייצוא דוחות לקבצים" },
    ],
  },
  {
    id: "attendance",
    name: "נוכחות",
    icon: Calendar,
    color: "bg-indigo-50 border-indigo-200",
    permissions: [
      { id: "attendance-view", name: "צפייה בנוכחות", description: "צפייה בנוכחות" },
      { id: "attendance-edit", name: "עריכת נוכחות", description: "עדכון נוכחות תלמידים ומורים" },
    ],
  },
  {
    id: "schedule",
    name: "לוח זמנים",
    icon: Calendar,
    color: "bg-teal-50 border-teal-200",
    permissions: [
      { id: "schedule-view", name: "צפייה בלוח זמנים", description: "צפייה בלוח הזמנים" },
      { id: "schedule-edit", name: "עריכת לוח זמנים", description: "עדכון לוח הזמנים" },
    ],
  },
  {
    id: "users",
    name: "משתמשים",
    icon: Users,
    color: "bg-violet-50 border-violet-200",
    permissions: [
      { id: "users-view", name: "צפייה במשתמשים", description: "צפייה ברשימת משתמשים" },
      { id: "users-edit", name: "עריכת משתמשים", description: "יצירה ועריכת משתמשים" },
      { id: "users-delete", name: "מחיקת משתמשים", description: "מחיקת משתמשים" },
    ],
  },
  {
    id: "settings",
    name: "הגדרות",
    icon: SettingsIcon,
    color: "bg-slate-50 border-slate-200",
    permissions: [
      { id: "dashboard", name: "דף הבית", description: "גישה לדף הבית" },
      { id: "settings-view", name: "צפייה בהגדרות", description: "צפייה בהגדרות המערכת" },
      { id: "settings-edit", name: "עריכת הגדרות", description: "עדכון הגדרות המערכת" },
    ],
  },
]

const allPermissions = permissionCategories.flatMap((cat) => cat.permissions)

const roleDefaultPermissions: Record<UserRole, string[]> = {
  "סופר אדמין": allPermissions.map((p) => p.id),
  מזכירה: [
    "dashboard",
    "courses-view",
    "students-view",
    "students-edit",
    "teachers-view",
    "schools-view",
    "registration-view",
    "registration-send",
    "attendance-view",
    "attendance-edit",
    "schedule-view",
  ],
  חשבונאות: [
    "dashboard",
    "cashier-view",
    "cashier-income",
    "cashier-expense",
    "reports-view",
    "reports-export",
    "students-view",
    "schools-view",
  ],
  מורה: ["dashboard", "courses-view", "students-view", "attendance-view", "attendance-edit", "schedule-view"],
  תלמיד: ["dashboard", "courses-view", "schedule-view"],
  אחר: ["dashboard"],
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "" as UserRole,
    permissions: [] as string[],
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const stored = localStorage.getItem("robotics-users")
    if (stored) {
      setUsers(JSON.parse(stored))
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
      permissions: roleDefaultPermissions[role] || [],
    })
  }

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter((p) => p !== permissionId)
      : [...formData.permissions, permissionId]

    setFormData({ ...formData, permissions: newPermissions })
  }

  const isCategoryFullySelected = (categoryId: string) => {
    const category = permissionCategories.find((c) => c.id === categoryId)
    if (!category) return false
    return category.permissions.every((p) => formData.permissions.includes(p.id))
  }

  const toggleCategoryPermissions = (categoryId: string) => {
    const category = permissionCategories.find((c) => c.id === categoryId)
    if (!category) return

    const categoryPermissionIds = category.permissions.map((p) => p.id)
    const allSelected = categoryPermissionIds.every((id) => formData.permissions.includes(id))

    if (allSelected) {
      // Remove all category permissions
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((id) => !categoryPermissionIds.includes(id)),
      })
    } else {
      // Add all category permissions
      const newPermissions = [...new Set([...formData.permissions, ...categoryPermissionIds])]
      setFormData({ ...formData, permissions: newPermissions })
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.role) {
      alert("יש למלא את כל השדות הנדרשים")
      return
    }

    const newUser: User = {
      id: editingUser?.id || `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      permissions: formData.permissions,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    }

    let updatedUsers
    if (editingUser) {
      updatedUsers = users.map((u) => (u.id === editingUser.id ? newUser : u))
    } else {
      updatedUsers = [...users, newUser]
    }

    localStorage.setItem("robotics-users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      role: user.role,
      permissions: user.permissions,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק משתמש זה?")) {
      const updatedUsers = users.filter((u) => u.id !== userId)
      localStorage.setItem("robotics-users", JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "" as UserRole,
      permissions: [],
    })
    setEditingUser(null)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "סופר אדמין":
        return "bg-purple-500 text-white"
      case "מזכירה":
        return "bg-blue-500 text-white"
      case "חשבונאות":
        return "bg-green-500 text-white"
      case "מורה":
        return "bg-orange-500 text-white"
      case "תלמיד":
        return "bg-cyan-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה
            </button>
            <h1 className="text-3xl font-bold text-gray-900">משתמשים</h1>
            <p className="text-gray-600">ניהול משתמשים והרשאות במערכת</p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                הוסף משתמש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? "עריכת משתמש" : "משתמש חדש"}</DialogTitle>
                <DialogDescription>הגדר את פרטי המשתמש והרשאותיו במערכת</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">שם מלא *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="הזן שם מלא..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">שם משתמש *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="הזן שם משתמש..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">סיסמה *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="הזן סיסמה..."
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">תפקיד *</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תפקיד..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="סופר אדמין">סופר אדמין</SelectItem>
                      <SelectItem value="מזכירה">מזכירה</SelectItem>
                      <SelectItem value="חשבונאות">חשבונאות</SelectItem>
                      <SelectItem value="מורה">מורה</SelectItem>
                      <SelectItem value="תלמיד">תלמיד</SelectItem>
                      <SelectItem value="אחר">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions by Category */}
                {formData.role && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <Label className="text-base font-semibold">הרשאות</Label>
                      <Badge variant="secondary" className="mr-auto">
                        {formData.permissions.length} הרשאות נבחרו
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {permissionCategories.map((category) => {
                        const Icon = category.icon
                        const isFullySelected = isCategoryFullySelected(category.id)

                        return (
                          <Card key={category.id} className={`border-2 ${category.color}`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-5 w-5" />
                                  <CardTitle className="text-base">{category.name}</CardTitle>
                                </div>
                                <Button
                                  variant={isFullySelected ? "secondary" : "outline"}
                                  size="sm"
                                  onClick={() => toggleCategoryPermissions(category.id)}
                                  className="h-7 text-xs"
                                >
                                  {isFullySelected ? "בטל הכל" : "בחר הכל"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {category.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-3 space-x-reverse">
                                  <Checkbox
                                    id={permission.id}
                                    checked={formData.permissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <div className="flex-1">
                                    <Label htmlFor={permission.id} className="cursor-pointer text-sm font-medium">
                                      {permission.name}
                                    </Label>
                                    <p className="text-xs text-gray-500">{permission.description}</p>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Button onClick={handleSubmit} className="w-full">
                  {editingUser ? "עדכן משתמש" : "הוסף משתמש"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>רשימת משתמשים</CardTitle>
            <CardDescription>כל המשתמשים הרשומים במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="py-12 text-center text-gray-500">לא נרשמו משתמשים עדיין</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>שם משתמש</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>תפקיד</TableHead>
                    <TableHead>הרשאות</TableHead>
                    <TableHead>תאריך יצירה</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{user.permissions.length} הרשאות</span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("he-IL")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
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
      </div>
    </div>
  )
}
