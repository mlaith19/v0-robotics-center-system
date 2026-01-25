"use client"

import { useEffect, useState } from "react"

interface CenterSettings {
  center_name: string
  logo: string
}

const CACHE_KEY = "center-settings-cache"
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

interface CachedSettings {
  data: CenterSettings
  cachedAt: number
}

export function useSettings() {
  const [settings, setSettings] = useState<CenterSettings>({
    center_name: "מרכז רובוטיקה",
    logo: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check cache first
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CachedSettings
        if (parsed.cachedAt && Date.now() - parsed.cachedAt < CACHE_DURATION) {
          setSettings(parsed.data)
          setLoading(false)
          return
        }
      } catch (e) {}
    }

    // Fetch fresh data
    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          const settingsData: CenterSettings = {
            center_name: data.center_name || "מרכז רובוטיקה",
            logo: data.logo || ""
          }
          setSettings(settingsData)
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: settingsData,
            cachedAt: Date.now()
          }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { settings, loading }
}

// Clear settings cache
export function clearSettingsCache() {
  sessionStorage.removeItem(CACHE_KEY)
}
