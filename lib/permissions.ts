export type PermissionCategory = {
  id: string
  name: string
  color: string
  permissions: Permission[]
}

export type Permission = {
  id: string
  name: string
  description: string
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "courses",
    name: "קורסים",
    color: "blue",
    permissions: [
      { id: "courses.view", name: "צפייה בקורסים", description: "צפייה ברשימת קורסים" },
      { id: "courses.edit", name: "עריכת קורסים", description: "יצירה ועריכת קורסים" },
      { id: "courses.delete", name: "מחיקת קורסים", description: "מחיקת קורסים" },
    ],
  },
  {
    id: "students",
    name: "תלמידים",
    color: "pink",
    permissions: [
      { id: "students.view", name: "צפייה בתלמידים", description: "צפייה ברשימת תלמידים" },
      { id: "students.edit", name: "עריכת תלמידים", description: "יצירה ועריכת תלמידים" },
      { id: "students.delete", name: "מחיקת תלמידים", description: "מחיקת תלמידים" },
    ],
  },
  {
    id: "schools",
    name: "בתי ספר",
    color: "orange",
    permissions: [
      { id: "schools.view", name: "צפייה בבתי ספר", description: "צפייה ברשימת בתי ספר" },
      { id: "schools.edit", name: "עריכת בתי ספר", description: "יצירה ועריכת בתי ספר" },
      { id: "schools.delete", name: "מחיקת בתי ספר", description: "מחיקת בתי ספר" },
    ],
  },
  {
    id: "teachers",
    name: "מורים",
    color: "green",
    permissions: [
      { id: "teachers.view", name: "צפייה במורים", description: "צפייה ברשימת מורים" },
      { id: "teachers.edit", name: "עריכת מורים", description: "יצירה ועריכת מורים" },
      { id: "teachers.delete", name: "מחיקת מורים", description: "מחיקת מורים" },
    ],
  },
  {
    id: "registration",
    name: "רישום",
    color: "cyan",
    permissions: [
      { id: "registration.view", name: "צפייה ברישומים", description: "צפייה ברשימת רישומים" },
      { id: "registration.send", name: "שליחת טופס רישום", description: "שליחת טופס רישום" },
    ],
  },
  {
    id: "gafan",
    name: 'תוכנית גפ"ן',
    color: "rose",
    permissions: [
      { id: "gafan.view", name: 'צפייה בתוכניות גפ"ן', description: 'צפייה ברשימת תוכניות גפ"ן' },
      { id: "gafan.edit", name: 'עריכת תוכניות גפ"ן', description: 'יצירה ועריכת תוכניות גפ"ן' },
      { id: "gafan.delete", name: 'מחיקת תוכניות גפ"ן', description: 'מחיקת תוכניות גפ"ן' },
    ],
  },
  {
    id: "reports",
    name: "דוחות",
    color: "yellow",
    permissions: [
      { id: "reports.view", name: "צפייה בדוחות", description: "צפייה בדוחות" },
      { id: "reports.export", name: "ייצוא דוחות", description: "ייצוא דוחות לקבצים" },
    ],
  },
  {
    id: "cashier",
    name: "קופה",
    color: "emerald",
    permissions: [
      { id: "cashier.view", name: "צפייה בקופה", description: "צפייה בהכנסות והוצאות" },
      { id: "cashier.income", name: "הוספת הכנסה", description: "רישום הכנסות" },
      { id: "cashier.expense", name: "הוספת הוצאה", description: "רישום הוצאות" },
      { id: "cashier.delete", name: "מחיקת תנועות", description: "מחיקת הכנסות והוצאות" },
    ],
  },
  {
    id: "schedule",
    name: "לוח זמנים",
    color: "sky",
    permissions: [
      { id: "schedule.view", name: "צפייה בלוח זמנים", description: "צפייה בלוח זמנים" },
      { id: "schedule.edit", name: "עריכת לוח זמנים", description: "עדכון לוח זמנים" },
    ],
  },
  {
    id: "attendance",
    name: "נוכחות",
    color: "purple",
    permissions: [
      { id: "attendance.view", name: "צפייה בנוכחות", description: "צפייה בנוכחות תלמידים" },
      { id: "attendance.edit", name: "עריכת נוכחות", description: "עדכון נוכחות תלמידים ומורים" },
    ],
  },
  {
    id: "settings",
    name: "הגדרות",
    color: "slate",
    permissions: [
      { id: "settings.home", name: "דף הבית", description: "גישה לדף הבית" },
      { id: "settings.view", name: "צפייה בהגדרות", description: "צפייה בהגדרות המערכת" },
      { id: "settings.edit", name: "עריכת הגדרות", description: "עדכון הגדרות המערכת" },
    ],
  },
  {
    id: "users",
    name: "משתמשים",
    color: "indigo",
    permissions: [
      { id: "users.view", name: "צפייה במשתמשים", description: "צפייה ברשימת משתמשים" },
      { id: "users.edit", name: "עריכת משתמשים", description: "יצירה ועריכת משתמשים" },
      { id: "users.delete", name: "מחיקת משתמשים", description: "מחיקת משתמשים" },
    ],
  },
]

export function getAllPermissions(): Permission[] {
  return PERMISSION_CATEGORIES.flatMap((cat) => cat.permissions)
}

export function hasPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission)
}

// תפקידים מוגדרים מראש עם הרשאות ברירת מחדל
export type RoleType = "admin" | "secretary" | "teacher" | "student" | "coordinator" | "other"

export interface RolePreset {
  id: RoleType
  name: string
  description: string
  permissions: string[]
  visiblePages: string[] // דפים שהתפקיד רואה בסרגל הצדדי
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "admin",
    name: "מנהל",
    description: "גישה מלאה לכל המערכת",
    permissions: getAllPermissions().map(p => p.id), // כל ההרשאות
    visiblePages: [
      "/dashboard",
      "/dashboard/registration",
      "/dashboard/courses",
      "/dashboard/students",
      "/dashboard/teachers",
      "/dashboard/schools",
      "/dashboard/gafan",
      "/dashboard/users",
      "/dashboard/cashier",
      "/dashboard/reports",
      "/dashboard/attendance",
      "/dashboard/schedule",
      "/dashboard/settings",
    ],
  },
  {
    id: "secretary",
    name: "מזכירה",
    description: "צפייה בכל + עריכת תלמידים וקורסים",
    permissions: [
      "courses.view", "courses.edit",
      "students.view", "students.edit",
      "schools.view",
      "teachers.view",
      "registration.view", "registration.send",
      "gafan.view",
      "reports.view",
      "cashier.view", "cashier.income",
      "schedule.view",
      "attendance.view", "attendance.edit",
      "settings.home",
    ],
    visiblePages: [
      "/dashboard",
      "/dashboard/registration",
      "/dashboard/courses",
      "/dashboard/students",
      "/dashboard/teachers",
      "/dashboard/schools",
      "/dashboard/gafan",
      "/dashboard/cashier",
      "/dashboard/reports",
      "/dashboard/attendance",
      "/dashboard/schedule",
    ],
  },
  {
    id: "teacher",
    name: "מורה",
    description: "צפייה בקורסים שלו, נוכחות ולוח זמנים",
    permissions: [
      "courses.view",
      "students.view",
      "teachers.view",
      "schedule.view",
      "attendance.view", "attendance.edit",
      "settings.home",
    ],
    visiblePages: [
      "/dashboard",
      "/dashboard/courses",
      "/dashboard/students",
      "/dashboard/teachers",
      "/dashboard/attendance",
      "/dashboard/schedule",
    ],
  },
  {
    id: "student",
    name: "תלמיד",
    description: "צפייה בפרטים האישיים בלבד",
    permissions: [
      "settings.home",
      "schedule.view",
      "courses.view",
      "students.view",
    ],
    visiblePages: [
      "/dashboard",
      "/dashboard/schedule",
      "/dashboard/courses",
      "/dashboard/students",
    ],
  },
  {
    id: "coordinator",
    name: "רכז",
    description: "ניהול קורסים, תוכניות גפ\"ן ובתי ספר",
    permissions: [
      "courses.view", "courses.edit",
      "students.view", "students.edit",
      "schools.view", "schools.edit",
      "teachers.view",
      "gafan.view", "gafan.edit",
      "reports.view",
      "schedule.view", "schedule.edit",
      "attendance.view", "attendance.edit",
      "settings.home",
    ],
    visiblePages: [
      "/dashboard",
      "/dashboard/courses",
      "/dashboard/students",
      "/dashboard/teachers",
      "/dashboard/schools",
      "/dashboard/gafan",
      "/dashboard/reports",
      "/dashboard/attendance",
      "/dashboard/schedule",
    ],
  },
  {
    id: "other",
    name: "אחר",
    description: "הרשאות מותאמות אישית",
    permissions: ["settings.home"],
    visiblePages: ["/dashboard"],
  },
]

export function getRoleById(roleId: RoleType): RolePreset | undefined {
  return ROLE_PRESETS.find(r => r.id === roleId)
}

export function getPermissionsForRole(roleId: RoleType): string[] {
  const role = getRoleById(roleId)
  return role?.permissions || []
}

export function getVisiblePagesForRole(roleId: RoleType): string[] {
  const role = getRoleById(roleId)
  return role?.visiblePages || ["/dashboard"]
}

// בדיקה האם למשתמש יש גישה לדף מסוים
export function canAccessPage(userPermissions: string[], userRole: RoleType, pagePath: string, studentId?: string, studentCourseIds?: string[]): boolean {
  // מנהל תמיד רואה הכל
  if (userRole === "admin" || userRole === "Administrator" || (userRole as string)?.toLowerCase() === "admin") return true
  
  const role = getRoleById(userRole)
  if (!role) return false
  
  // For students, check if they're accessing their own data
  if (userRole === "student") {
    // Allow access to main dashboard
    if (pagePath === "/dashboard") return true
    
    // Allow access to schedule
    if (pagePath === "/dashboard/schedule") return true
    
    // Allow access only to their own student page
    if (pagePath.startsWith("/dashboard/students/") && studentId) {
      const pathStudentId = pagePath.split("/")[3]
      if (pathStudentId === studentId) return true
      return false
    }
    
    // Allow access only to their enrolled courses
    if (pagePath.startsWith("/dashboard/courses/") && studentCourseIds) {
      const pathCourseId = pagePath.split("/")[3]
      if (studentCourseIds.includes(pathCourseId)) return true
      return false
    }
    
    // Block access to courses list (they can only see their specific courses)
    if (pagePath === "/dashboard/courses") return false
    if (pagePath === "/dashboard/students") return false
  }
  
  return role.visiblePages.some(page => pagePath === page || pagePath.startsWith(page + "/"))
}
