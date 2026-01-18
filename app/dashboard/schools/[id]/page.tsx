import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Pencil, Mail, Phone, MapPin, User2 } from "lucide-react"

type Params = { id: string }
async function unwrapParams(params: any): Promise<Params> {
  return await Promise.resolve(params)
}

function safe(v: any) {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
}

export default async function SchoolViewPage({ params }: { params: Params | Promise<Params> }) {
  const { id } = await unwrapParams(params)

  const school = await prisma.school.findUnique({ where: { id } })
  if (!school) return <div className="p-6">לא נמצא בית ספר</div>

  return (
    <div dir="rtl" className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/schools">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">פרטי בית ספר</h1>
            <p className="text-muted-foreground mt-1">{school.name}</p>
          </div>
        </div>

        <Link href={`/dashboard/schools/${school.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            ערוך
          </Button>
        </Link>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> עיר
            </div>
            <div className="font-medium">{safe(school.city)}</div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <User2 className="h-4 w-4" /> איש קשר
            </div>
            <div className="font-medium">{safe(school.contactName)}</div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" /> טלפון
            </div>
            <div className="font-medium">{safe(school.phone)}</div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" /> אימייל
            </div>
            <div className="font-medium">{safe(school.email)}</div>
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <div className="text-sm text-muted-foreground">כתובת</div>
          <div className="font-medium">{safe(school.address)}</div>
        </div>

        <div className="p-4 border rounded-lg space-y-2 bg-muted/30">
          <div className="text-sm text-muted-foreground">הערות</div>
          <div className="font-medium whitespace-pre-wrap">{safe(school.notes)}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">נוצר</div>
            <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(school.createdAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">עודכן</div>
            <div>{new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(school.updatedAt)}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
