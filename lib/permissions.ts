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