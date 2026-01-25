"use client"

import { useEffect, useState, useRef } from "react"

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

// Global flag to prevent concurrent fetches
let isFetching = false
const pendingCallbacks: ((data: UserTypeData | null) => void)[] = []

export function useUserType(userId: number | undefined) {
  const [data, setData] = useState<UserTypeData | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Prevent double fetching in strict mode
    if (fetchedRef.current) return
    fetchedRef.current = true

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

    // If already fetching, wait for result
    if (isFetching) {
      pendingCallbacks.push((result) => {
        setData(result)
        setLoading(false)
      })
      return
    }

    // Start fetching
    isFetching = true

    const checkUserType = async () => {
      let result: UserTypeData = { isTeacher: false, isStudent: false }
      
      try {
        // Check teacher first
        const teacherRes = await fetch(`/api/teachers/by-user/${userId}`)
        if (teacherRes.ok) {
          const teacherData = await teacherRes.json()
          if (teacherData?.id) {
            result = {
              isTeacher: true,
              isStudent: false,
              teacherId: teacherData.id,
              courseIds: teacherData.courseIds || [],
              checkedAt: Date.now()
            }
            sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
            setData(result)
            setLoading(false)
            notifyPending(result)
            return
          }
        }

        // Check student if not teacher
        const studentRes = await fetch(`/api/students/by-user/${userId}`)
        if (studentRes.ok) {
          const studentData = await studentRes.json()
          if (studentData?.id) {
            result = {
              isTeacher: false,
              isStudent: true,
              studentId: studentData.id,
              courseIds: studentData.courseIds || [],
              checkedAt: Date.now()
            }
            sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
            setData(result)
            setLoading(false)
            notifyPending(result)
            return
          }
        }

        // Neither teacher nor student
        result.checkedAt = Date.now()
        sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
        setData(result)
        setLoading(false)
        notifyPending(result)
      } catch (error) {
        // On error, set as neither (don't cache errors)
        setData(result)
        setLoading(false)
        notifyPending(result)
      } finally {
        isFetching = false
      }
    }

    checkUserType()
  }, [userId])

  return { data, loading }
}

function notifyPending(result: UserTypeData | null) {
  while (pendingCallbacks.length > 0) {
    const cb = pendingCallbacks.shift()
    cb?.(result)
  }
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
