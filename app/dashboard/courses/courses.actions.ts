// app/dashboard/courses/courses.actions.ts

export type CreateCoursePayload = {
  name?: string
  title?: string
  description?: string
  price?: number | string | null
  isActive?: boolean
  duration?: string
  level?: string
  status?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  weekdays?: string[]
  teachers?: string[] | number[]
}

export type UpdateCoursePayload = {
  title?: string
  name?: string
  description?: string | null
  price?: number | string | null
  isActive?: boolean
  duration?: string | null
  level?: string | null
  status?: string | null
  startDate?: string | null
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  weekdays?: string[]
  teachers?: string[] | number[]
}

export async function fetchCourses(): Promise<any[]> {
  const res = await fetch("/api/courses", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch courses")
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function createCourse(payload: CreateCoursePayload): Promise<any> {
  const res = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || "Failed to create course")
  }

  return res.json()
}

export async function updateCourse(courseId: string, payload: UpdateCoursePayload): Promise<any> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || "Failed to update course")
  }

  return res.json()
}

export async function deleteCourse(courseId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || "Failed to delete course")
  }
}
