"use client"

import { useEffect, useState } from "react"

interface UserTypeData {
  isTeacher: boolean
  isStudent: boolean
  teacherId?: string
  studentId?: string
  courseIds?: string[]
  checkedAt?: number
}

const CACHE_KEY = "user-type-cache"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useUserType(userId: number | undefined) {
  const [data, setData] = useState<UserTypeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Check cache first
    const cached = sessionStorage.getItem(`${CACHE_KEY}-${userId}`)
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserTypeData
        if (parsed.checkedAt && Date.now() - parsed.checkedAt < CACHE_DURATION) {
          setData(parsed)
          setLoading(false)
          return
        }
      } catch (e) {}
    }

    // Fetch fresh data
    let cancelled = false

    const checkUserType = async () => {
      try {
        // Check teacher first
        const teacherRes = await fetch(`/api/teachers/by-user/${userId}`)
        if (!cancelled && teacherRes.ok) {
          const teacherData = await teacherRes.json()
          if (teacherData?.id) {
            const result: UserTypeData = {
              isTeacher: true,
              isStudent: false,
              teacherId: teacherData.id,
              courseIds: teacherData.courseIds || [],
              checkedAt: Date.now()
            }
            sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
            setData(result)
            setLoading(false)
            return
          }
        }

        // Check student if not teacher
        const studentRes = await fetch(`/api/students/by-user/${userId}`)
        if (!cancelled && studentRes.ok) {
          const studentData = await studentRes.json()
          if (studentData?.id) {
            const result: UserTypeData = {
              isTeacher: false,
              isStudent: true,
              studentId: studentData.id,
              courseIds: studentData.courseIds || [],
              checkedAt: Date.now()
            }
            sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
            setData(result)
            setLoading(false)
            return
          }
        }

        // Neither teacher nor student
        const result: UserTypeData = {
          isTeacher: false,
          isStudent: false,
          checkedAt: Date.now()
        }
        sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
        setData(result)
        setLoading(false)
      } catch (error) {
        // On error, set as neither (don't cache errors)
        if (!cancelled) {
          setData({ isTeacher: false, isStudent: false })
          setLoading(false)
        }
      }
    }

    checkUserType()

    return () => { cancelled = true }
  }, [userId])

  return { data, loading }
}

// Clear cache on logout
export function clearUserTypeCache() {
  const keys = Object.keys(sessionStorage)
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY)) {
      sessionStorage.removeItem(key)
    }
  })
}
