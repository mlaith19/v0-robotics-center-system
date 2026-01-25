"use client"

import { useEffect, useState } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  showLogo?: boolean
  useCenterNameInDescription?: boolean
}

interface CenterSettings {
  logo: string
  center_name: string
}

export function PageHeader({ title, description, showLogo = false, useCenterNameInDescription = false }: PageHeaderProps) {
  const [settings, setSettings] = useState<CenterSettings>({ logo: "", center_name: "" })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          setSettings({
            logo: data.logo || "",
            center_name: data.center_name || ""
          })
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      }
    }
    fetchSettings()
  }, [])

  // Build description with center name if needed
  const finalDescription = useCenterNameInDescription && settings.center_name
    ? `${description} ${settings.center_name}`
    : description

  return (
    <div className="flex items-center justify-end gap-4">
      {showLogo && settings.logo && (
        <img 
          src={settings.logo || "/placeholder.svg"} 
          alt="לוגו" 
          className="h-14 w-14 object-contain rounded"
        />
      )}
      <div className="text-right">
        <h1 className="text-3xl font-bold">{title}</h1>
        {finalDescription && (
          <p className="text-muted-foreground mt-1">{finalDescription}</p>
        )}
      </div>
    </div>
  )
}
