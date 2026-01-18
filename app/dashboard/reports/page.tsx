"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Construction } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">דוחות</h1>
          <p className="text-muted-foreground">צפייה והפקת דוחות מערכת</p>
        </div>
      </div>

      <Card className="max-w-lg mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">הדף לא זמין כרגע</CardTitle>
          <CardDescription>
            אנחנו עובדים על הוספת מודול הדוחות למערכת
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            בקרוב תוכלו להפיק דוחות נוכחות, דוחות כספיים, דוחות תלמידים ועוד.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <span className="text-sm">צפוי להיות זמין בגרסה הבאה</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
