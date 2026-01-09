import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, User, Mail, Phone, Edit, ChevronLeft } from "lucide-react"
import { StudentTabs } from "@/components/student/student-tabs"

type Params = { id: string }

// ✅ Next 16 לפעמים נותן params בתור Promise – זה פותר לך את השגיאה
async function unwrapParams(params: any): Promise<Params> {
  return await Promise.resolve(params)
}

function safeText(v: any) {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
}

export default async function StudentViewPage({ params }: { params: Params | Promise<Params> }) {
  const { id } = await unwrapParams(params)

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: { include: { course: true }, orderBy: { joinedAt: "desc" } },
      payments: { orderBy: { paidAt: "desc" } },
      attendances: { include: { course: true }, orderBy: { date: "desc" } },
    },
  })

  if (!student) {
    return <div className="text-center py-10">לא נמצא תלמיד</div>
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/students">
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-foreground">פרטי תלמיד</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Link href="/dashboard/students" className="hover:text-foreground transition-colors">
                  תלמידים
                </Link>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-foreground font-medium">{student.name}</span>
              </div>
            </div>
          </div>

          <Link href={`/dashboard/students/${student.id}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              ערוך תלמיד
            </Button>
          </Link>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{student.name}</h3>
            <span
              className={`inline-block text-sm px-3 py-1 rounded-full mt-2 ${
                student.status === "פעיל" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}
            >
              {student.status}
            </span>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4" />
                  <span>אימייל</span>
                </div>
                <p className="text-foreground font-medium">{safeText(student.email)}</p>
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4" />
                  <span>טלפון</span>
                </div>
                <p className="text-foreground font-medium">{safeText(student.phone)}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">נוצר בתאריך</p>
              <p className="text-foreground font-medium text-lg">
                {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(student.createdAt)}
              </p>
            </div>
          </div>

          {/* ✅ הטאבים מחוברים ל-DB */}
          <StudentTabs
            enrollments={student.enrollments as any}
            payments={student.payments as any}
            attendances={student.attendances as any}
          />
        </Card>
      </div>
    </div>
  )
}
