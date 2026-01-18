export type TeacherDTO = {
  id: string
  name: string
  email?: string | null
  phone?: string | null

  // שדות “VO” שהיו אצלך בטופס
  status?: string | null
  idNumber?: string | null
  birthDate?: string | null // ISO string
  city?: string | null
  specialties?: string | null
  notes?: string | null
  rateCenter?: number | null
  rateTravel?: number | null
  rateExternal?: number | null

  createdAt?: string
  updatedAt?: string

  // אופציונלי: אם בעתיד תרצה להציג קורסים משוייכים למורה
  courses?: { id: string; title: string }[]
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function getTeachers(): Promise<TeacherDTO[]> {
  const res = await fetch(`/api/teachers`, { cache: "no-store" })
  const data = await safeJson(res)
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load teachers")
  return (Array.isArray(data) ? data : []) as TeacherDTO[]
}

export async function getTeacher(id: string): Promise<TeacherDTO> {
  const res = await fetch(`/api/teachers/${id}`, { cache: "no-store" })
  const data = await safeJson(res)
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load teacher")
  return data as TeacherDTO
}

export async function createTeacher(payload: Partial<TeacherDTO>): Promise<TeacherDTO> {
  const res = await fetch(`/api/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error((data as any)?.error || "Failed to create teacher")
  return data as TeacherDTO
}

export async function updateTeacher(id: string, payload: Partial<TeacherDTO>): Promise<TeacherDTO> {
  const res = await fetch(`/api/teachers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error((data as any)?.error || "Failed to update teacher")
  return data as TeacherDTO
}

export async function deleteTeacher(id: string): Promise<{ ok: true }> {
  const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" })
  const data = await safeJson(res)
  if (!res.ok) throw new Error((data as any)?.error || "Failed to delete teacher")
  return { ok: true }
}
