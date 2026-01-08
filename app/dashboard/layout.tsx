"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import {
  Bot,
  BookOpen,
  Users,
  Calendar,
  Settings,
  Home,
  Menu,
  X,
  GraduationCap,
  School,
  Rocket,
  UserCircle,
  Wallet,
  FileText,
  ClipboardCheck,
  UserPlus,
} from "lucide-react"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", icon: Home, label: "דף הבית" },
  { href: "/dashboard/registration", icon: UserPlus, label: "רישום" },
  { href: "/dashboard/courses", icon: BookOpen, label: "קורסים" },
  { href: "/dashboard/students", icon: Users, label: "תלמידים" },
  { href: "/dashboard/teachers", icon: GraduationCap, label: "מורים" },
  { href: "/dashboard/schools", icon: School, label: "בתי ספר" },
  { href: "/dashboard/gafan", icon: Rocket, label: 'תוכניות גפ"ן' },
  { href: "/dashboard/users", icon: UserCircle, label: "משתמשים" },
  { href: "/dashboard/cashier", icon: Wallet, label: "קופה" },
  { href: "/dashboard/reports", icon: FileText, label: "דוחות" },
  { href: "/dashboard/attendance", icon: ClipboardCheck, label: "נוכחות" },
  { href: "/dashboard/schedule", icon: Calendar, label: "לוח זמנים" },
  { href: "/dashboard/settings", icon: Settings, label: "הגדרות" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("robotics-current-user")
    if (!userStr) {
      router.push("/login")
    } else {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("robotics-current-user")
    router.push("/login")
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 transform border-l border-border bg-card transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">מרכז רובוטיקה</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-border p-4 space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentUser.username}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              התנתק
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
