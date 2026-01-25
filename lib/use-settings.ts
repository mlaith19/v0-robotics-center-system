"use client"

import { useEffect, useState, useRef } from "react"

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

// Global flag to prevent concurrent fetches
let isFetching = false
const pendingCallbacks: ((settings: CenterSettings) => void)[] = []

const DEFAULT_SETTINGS: CenterSettings = {
  center_name: "מרכז רובוטיקה",
  logo: ""
}

export function useSettings() {
  const [settings, setSettings] = useState<CenterSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Prevent double fetching in strict mode
    if (fetchedRef.current) return
    fetchedRef.current = true

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

    // If already fetching, wait for result
    if (isFetching) {
      pendingCallbacks.push((result) => {
        setSettings(result)
        setLoading(false)
      })
      return
    }

    // Start fetching
    isFetching = true

    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const settingsData: CenterSettings = data ? {
          center_name: data.center_name || "מרכז רובוטיקה",
          logo: data.logo || ""
        } : DEFAULT_SETTINGS
        
        setSettings(settingsData)
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: settingsData,
          cachedAt: Date.now()
        }))
        setLoading(false)
        notifyPending(settingsData)
      })
      .catch(() => {
        setLoading(false)
        notifyPending(DEFAULT_SETTINGS)
      })
      .finally(() => {
        isFetching = false
      })
  }, [])

  return { settings, loading }
}

function notifyPending(settings: CenterSettings) {
  while (pendingCallbacks.length > 0) {
    const cb = pendingCallbacks.shift()
    cb?.(settings)
  }
}

// Clear settings cache
export function clearSettingsCache() {
  sessionStorage.removeItem(CACHE_KEY)
}
