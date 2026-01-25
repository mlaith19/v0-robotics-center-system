"use client"

import { useEffect, useState } from "react"

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const [logo, setLogo] = useState<string>("")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.logo) {
            setLogo(data.logo)
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <div className="flex items-center justify-end gap-4">
      {logo && (
        <img 
          src={logo || "/placeholder.svg"} 
          alt="לוגו" 
          className="h-12 w-12 object-contain rounded"
        />
      )}
      <div className="text-right">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
