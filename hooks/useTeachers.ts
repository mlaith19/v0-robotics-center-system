"use client"

import { useEffect, useMemo, useState } from "react"
import type { Teacher } from "@/lib/services/teachers"
import { listTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/lib/services/teachers"

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const reload = async () => {
    setError("")
    setLoading(true)
    try {
      const data = await listTeachers()
      setTeachers(data)
    } catch (e: any) {
      setError(e?.message || "Failed to load teachers")
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const count = useMemo(() => teachers.length, [teachers])

  const add = async (input: { name: string; email?: string; phone?: string }) => {
    setError("")
    const created = await createTeacher(input)
    setTeachers((prev) => [created, ...prev])
    return created
  }

  const edit = async (id: string, input: { name: string; email?: string; phone?: string }) => {
    setError("")
    const updated = await updateTeacher(id, input)
    setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }

  const remove = async (id: string) => {
    setError("")
    await deleteTeacher(id)
    setTeachers((prev) => prev.filter((t) => t.id !== id))
  }

  return { teachers, loading, error, count, reload, add, edit, remove }
}
