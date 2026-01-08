import { Card } from "@/components/ui/card"
import { BookOpen, Users, Calendar, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">דף הבית</h1>
        <p className="text-muted-foreground mt-2">סקירה כללית של מרכז הרובוטיקה</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">סה"כ קורסים</p>
              <p className="text-3xl font-bold text-foreground mt-2">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">תלמידים פעילים</p>
              <p className="text-3xl font-bold text-foreground mt-2">156</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">שיעורים השבוע</p>
              <p className="text-3xl font-bold text-foreground mt-2">24</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">שיעור השלמה</p>
              <p className="text-3xl font-bold text-foreground mt-2">89%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">פעילות אחרונה</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">קורס חדש נוסף: תכנות Python למתקדמים</p>
              <p className="text-xs text-muted-foreground">לפני 2 שעות</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">5 תלמידים חדשים נרשמו</p>
              <p className="text-xs text-muted-foreground">לפני 4 שעות</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">שיעור בינה מלאכותית מתוזמן למחר</p>
              <p className="text-xs text-muted-foreground">אתמול</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
