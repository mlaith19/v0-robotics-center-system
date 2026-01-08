"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Mail, Phone, MapPin, Users, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface School {
  id: number
  name: string
  address: string
  phone: string
  email: string
  contactPerson: string
  type: string
  status: string
  joinDate: string
  notes?: string
  coursesCount?: number
  studentsCount?: number
}

export default function SchoolViewPage() {
  const params = useParams()
  const [school, setSchool] = useState<School | null>(null)

  useEffect(() => {
    const schools = JSON.parse(localStorage.getItem("robotics-schools") || "[]")
    const found = schools.find((s: School) => s.id === Number(params.id))
    if (found) {
      setSchool(found)
    }
  }, [params.id])

  if (!school) {
    return <div className="p-6">טוען...</div>
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/schools">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">פרטי בית ספר</h1>
            <p className="text-muted-foreground mt-1">בתי ספר ‹ {school.name}</p>
          </div>
        </div>
        <Link href={`/dashboard/schools/${school.id}/edit`}>
          <Button>ערוך פרטים</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="general" dir="rtl">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general">כללי</TabsTrigger>
              <TabsTrigger value="courses">קורסים</TabsTrigger>
              <TabsTrigger value="students">תלמידים</TabsTrigger>
              <TabsTrigger value="activity">פעילות</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{school.name}</h2>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    school.status === "פעיל"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : school.status === "מתעניין"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {school.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <div>
                      <div className="text-xs">כתובת</div>
                      <div className="text-sm font-medium text-foreground">{school.address}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                    <div>
                      <div className="text-xs">טלפון</div>
                      <div className="text-sm font-medium text-foreground">{school.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <div>
                      <div className="text-xs">אימייל</div>
                      <div className="text-sm font-medium text-foreground">{school.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <div>
                      <div className="text-xs">איש קשר</div>
                      <div className="text-sm font-medium text-foreground">{school.contactPerson}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">סוג בית הספר</div>
                <div className="text-sm font-medium text-foreground">{school.type}</div>
              </div>

              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <div className="text-xs">תאריך הצטרפות</div>
                    <div className="text-sm font-medium text-foreground">{school.joinDate}</div>
                  </div>
                </div>
              </div>

              {school.notes && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">הערות</div>
                  <div className="text-sm text-foreground whitespace-pre-wrap">{school.notes}</div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {school.coursesCount && school.coursesCount > 0
                    ? `${school.coursesCount} קורסים פעילים`
                    : "אין קורסים משויכים"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {school.studentsCount && school.studentsCount > 0
                    ? `${school.studentsCount} תלמידים רשומים`
                    : "אין תלמידים רשומים"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">אין פעילות אחרונה</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
