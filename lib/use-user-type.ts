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
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Helper function to fetch with retry on rate limit
async function fetchWithRetry(url: string, maxRetries = 3, delayMs = 1000): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url)
    if (res.status !== 429) return res
    // Wait before retry, increasing delay each time
    await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
  }
  // Return the last response even if it's still 429
  return fetch(url)
}

export function useUserType(userId: number | undefined) {
  const [data, setData] = useState<UserTypeData | null>(() => {
    // Initialize from cache if available
    if (typeof window === 'undefined' || !userId) return null
    try {
      const cached = sessionStorage.getItem(`${CACHE_KEY}-${userId}`)
      if (cached) {
        const parsed = JSON.parse(cached) as UserTypeData
        if (parsed.checkedAt && Date.now() - parsed.checkedAt < CACHE_DURATION) {
          return parsed
        }
      }
    } catch (e) {}
    return null
  })
  const [loading, setLoading] = useState(() => !data)
  const fetchStartedRef = useRef(false)

  useEffect(() => {
    // No user ID - nothing to do
    if (!userId) {
      setLoading(false)
      return
    }
    
    // Already have data from cache
    if (data) {
      setLoading(false)
      return
    }

    // Prevent multiple fetch attempts
    if (fetchStartedRef.current) return
    fetchStartedRef.current = true

    const checkUserType = async () => {
      let result: UserTypeData = { isTeacher: false, isStudent: false, checkedAt: Date.now() }
      
      try {
        // Check teacher first with retry
        const teacherRes = await fetchWithRetry(`/api/teachers/by-user/${userId}`)
        
        if (teacherRes.ok) {
          try {
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
              return
            }
          } catch (e) {
            // JSON parse error - continue to check student
          }
        }

        // Wait before checking student
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check student with retry
        const studentRes = await fetchWithRetry(`/api/students/by-user/${userId}`)
        
        if (studentRes.ok) {
          try {
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
              return
            }
          } catch (e) {
            // JSON parse error - use default
          }
        }

        // Neither teacher nor student - cache this result too
        sessionStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify(result))
        setData(result)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error checking user type:", error)
        // On error, set default (don't cache errors)
        setData(result)
        setLoading(false)
      }
    }

    checkUserType()
  }, [userId, data])

  return { data, loading }
}

// Clear cache on logout
export function clearUserTypeCache() {
  if (typeof window === 'undefined') return
  try {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY)) {
        sessionStorage.removeItem(key)
      }
    })
  } catch (e) {}
}
