// app/dashboard/courses/courses.hooks.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchCourses } from "./courses.actions"

export function useCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const reloadCourses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCourses()
      setCourses(data)
    } catch (e) {
      console.error("Failed to load courses:", e)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reloadCourses()
  }, [reloadCourses])

  return { courses, setCourses, reloadCourses, loading }
}
