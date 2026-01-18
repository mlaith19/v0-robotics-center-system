import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const PERMISSIONS = [
  // courses
  { key: "courses-view", name: "צפייה בקורסים", description: "צפייה ברשימת קורסים", category: "courses" },
  { key: "courses-edit", name: "עריכת קורסים", description: "יצירה ועריכת קורסים", category: "courses" },
  { key: "courses-delete", name: "מחיקת קורסים", description: "מחיקת קורסים", category: "courses" },

  // students
  { key: "students-view", name: "צפייה בתלמידים", description: "צפייה ברשימת תלמידים", category: "students" },
  { key: "students-edit", name: "עריכת תלמידים", description: "יצירה ועריכת תלמידים", category: "students" },
  { key: "students-delete", name: "מחיקת תלמידים", description: "מחיקת תלמידים", category: "students" },

  // teachers
  { key: "teachers-view", name: "צפייה במורים", description: "צפייה ברשימת מורים", category: "teachers" },
  { key: "teachers-edit", name: "עריכת מורים", description: "יצירה ועריכת מורים", category: "teachers" },
  { key: "teachers-delete", name: "מחיקת מורים", description: "מחיקת מורים", category: "teachers" },

  // schools
  { key: "schools-view", name: "צפייה בבתי ספר", description: "צפייה ברשימת בתי ספר", category: "schools" },
  { key: "schools-edit", name: "עריכת בתי ספר", description: "יצירה ועריכת בתי ספר", category: "schools" },
  { key: "schools-delete", name: "מחיקת בתי ספר", description: "מחיקת בתי ספר", category: "schools" },

  // gafan
  { key: "gafan-view", name: 'צפייה בתוכניות גפ"ן', description: 'צפייה ברשימת תוכניות גפ"ן', category: "gafan" },
  { key: "gafan-edit", name: 'עריכת תוכניות גפ"ן', description: 'יצירה ועריכת תוכניות גפ"ן', category: "gafan" },
  { key: "gafan-delete", name: 'מחיקת תוכניות גפ"ן', description: 'מחיקת תוכניות גפ"ן', category: "gafan" },

  // registration
  { key: "registration-view", name: "צפייה ברישומים", description: "צפייה ברשימת רישומים", category: "registration" },
  { key: "registration-send", name: "שליחת טופס רישום", description: "שליחת טפסי רישום", category: "registration" },

  // cashier
  { key: "cashier-view", name: "צפייה בקופה", description: "צפייה בהכנסות והוצאות", category: "cashier" },
  { key: "cashier-income", name: "הוספת הכנסה", description: "רישום הכנסות", category: "cashier" },
  { key: "cashier-expense", name: "הוספת הוצאה", description: "רישום הוצאות", category: "cashier" },
  { key: "cashier-delete", name: "מחיקת תנועות", description: "מחיקת הכנסות והוצאות", category: "cashier" },

  // reports
  { key: "reports-view", name: "צפייה בדוחות", description: "צפייה בדוחות", category: "reports" },
  { key: "reports-export", name: "ייצוא דוחות", description: "ייצוא דוחות לקבצים", category: "reports" },

  // attendance
  { key: "attendance-view", name: "צפייה בנוכחות", description: "צפייה בנוכחות", category: "attendance" },
  { key: "attendance-edit", name: "עריכת נוכחות", description: "עדכון נוכחות תלמידים ומורים", category: "attendance" },

  // schedule
  { key: "schedule-view", name: "צפייה בלוח זמנים", description: "צפייה בלוח הזמנים", category: "schedule" },
  { key: "schedule-edit", name: "עריכת לוח זמנים", description: "עדכון לוח הזמנים", category: "schedule" },

  // users
  { key: "users-view", name: "צפייה במשתמשים", description: "צפייה ברשימת משתמשים", category: "users" },
  { key: "users-edit", name: "עריכת משתמשים", description: "יצירה ועריכת משתמשים", category: "users" },
  { key: "users-delete", name: "מחיקת משתמשים", description: "מחיקת משתמשים", category: "users" },

  // settings
  { key: "dashboard", name: "דף הבית", description: "גישה לדף הבית", category: "settings" },
  { key: "settings-view", name: "צפייה בהגדרות", description: "צפייה בהגדרות המערכת", category: "settings" },
  { key: "settings-edit", name: "עריכת הגדרות", description: "עדכון הגדרות המערכת", category: "settings" },
]

export async function POST() {
  try {
    // 1) Seed permissions
    await prisma.permission.createMany({
      data: PERMISSIONS,
      skipDuplicates: true,
    })

    // 2) Ensure ADMIN role exists
    const adminRole = await prisma.role.upsert({
      where: { key: "ADMIN" },
      update: {},
      create: { key: "ADMIN", name: "מנהל מערכת" },
    })

    // 3) Give ADMIN all permissions
    const perms = await prisma.permission.findMany({ select: { id: true, key: true } })
    await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } })
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
      skipDuplicates: true,
    })

    return NextResponse.json({
      ok: true,
      permissions: perms.length,
      adminRoleId: adminRole.id,
    })
  } catch (err: any) {
    console.error("POST /api/seed error:", err)
    return NextResponse.json({ error: "Seed failed" }, { status: 500 })
  }
}
