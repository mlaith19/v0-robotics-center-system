import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Pencil } from "lucide-react"

type Params = { id: string }
async function unwrapParams(params: any): Promise<Params> {
  return await Promise.resolve(params)
}

export default async function CourseViewPage({ params }: { params: Params | Promise<Params> }) {
  const { id } = await unwrapParams(params)

  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) return <div className="p-6">לא נמצא קורס</div>

  return (
    <div dir="rtl" className="container mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">פרטי קורס</h1>
            <p className="text-muted-foreground mt-1">{course.name}</p>
          </div>
        </div>

        <Link href={`/dashboard/courses/${course.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            ערוך
          </Button>
        </Link>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">שם</div>
          <div className="text-xl font-semibold">{course.name}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">נוצר</div>
            <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(course.createdAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">עודכן</div>
            <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(course.updatedAt)}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
