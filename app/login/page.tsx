"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, User, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // יוזר סופר אדמין ברירת מחדל
  const SUPER_ADMIN = {
    username: "admin",
    password: "admin123",
    role: "סופר אדמין",
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // המתנה קצרה לסימולציה
    await new Promise((resolve) => setTimeout(resolve, 800))

    // בדיקה מול יוזר סופר אדמין
    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      // שמירת המשתמש המחובר
      const currentUser = {
        username: SUPER_ADMIN.username,
        role: SUPER_ADMIN.role,
        loginTime: new Date().toISOString(),
      }
      localStorage.setItem("robotics-current-user", JSON.stringify(currentUser))

      // ניתוב לדף משתמשים
      router.push("/dashboard/users")
    } else {
      // בדיקה מול משתמשים רשומים
      const users = JSON.parse(localStorage.getItem("robotics-users") || "[]")
      const user = users.find((u: any) => u.username === username && u.password === password)

      if (user) {
        const currentUser = {
          username: user.username,
          role: user.role,
          loginTime: new Date().toISOString(),
          permissions: user.permissions,
        }
        localStorage.setItem("robotics-current-user", JSON.stringify(currentUser))

        // ניתוב לדף הבית
        router.push("/dashboard")
      } else {
        setError("שם משתמש או סיסמה שגויים")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* לוגו וכותרת */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">מערכת ניהול רובוטיקה</h1>
          <p className="text-gray-600">התחבר למערכת כדי להמשיך</p>
        </div>

        {/* כרטיס התחברות */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">התחברות</CardTitle>
            <CardDescription className="text-center">הזן את שם המשתמש והסיסמה שלך</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-base">
                  שם משתמש
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="הכנס שם משתמש"
                    className="pr-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  סיסמה
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הכנס סיסמה"
                    className="pr-10 h-11"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  "מתחבר..."
                ) : (
                  <>
                    <LogIn className="ml-2 h-5 w-5" />
                    התחבר למערכת
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
