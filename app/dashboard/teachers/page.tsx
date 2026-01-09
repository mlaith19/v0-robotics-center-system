"use client"

import { EntityList } from "@/components/entity/entity-list"
import { hasPermission } from "@/lib/permissions"

type Teacher = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export default function TeachersPage() {
  const canDelete = hasPermission("teachers-delete")

  return (
    <EntityList<Teacher>
      title="מורים"
      subtitle="ניהול צוות ההוראה"
      basePath="/dashboard/teachers"
      apiBase="/api/teachers"
      canDelete={canDelete}
      getTitle={(t) => t.name}
      getSubtitle={(t) => t.email ?? "—"}
      columns={[
        {
          header: "שם",
          cell: (t) => <div className="font-medium">{t.name}</div>,
        },
        {
          header: "אימייל",
          cell: (t) => t.email ?? "-",
        },
        {
          header: "טלפון",
          cell: (t) => t.phone ?? "-",
        },
      ]}
    />
  )
}
