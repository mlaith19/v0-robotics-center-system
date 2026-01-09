"use client"

import { EntityList, type EntityListProps } from "@/components/entity/entity-list"
import { hasPermission } from "@/lib/permissions"

type Student = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  status?: string | null
  createdAt?: string
}

export default function StudentsPage() {
  const canDelete = hasPermission("students-delete")

  const props: EntityListProps<Student> = {
    title: "תלמידים",
    subtitle: "נהל את כל התלמידים במרכז",
    basePath: "/dashboard/students",
    apiBase: "/api/students",
    canDelete: canDelete,
    getTitle: (s) => s.name,
    getSubtitle: (s) => s.status ?? "—",
    columns: [
      { header: "שם", cell: (s) => <div className="text-sm font-medium">{s.name}</div> },
      { header: "אימייל", cell: (s) => <div className="text-sm text-muted-foreground">{s.email ?? "-"}</div> },
      { header: "טלפון", cell: (s) => <div className="text-sm text-muted-foreground">{s.phone ?? "-"}</div> },
      { header: "סטטוס", cell: (s) => <div className="text-sm text-muted-foreground">{s.status ?? "-"}</div> },
    ],
  }

  return <EntityList {...props} />
}
