"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const ISRAELI_CITIES = [
  "ירושלים",
  "תל אביב-יפו",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "אשדוד",
  "נתניה",
  "באר שבע",
  "בני ברק",
  "חולון",
  "רמת גן",
  "אשקלון",
  "רחובות",
  "בת ים",
  "בית שמש",
  "כפר סבא",
  "הרצליה",
  "חדרה",
  "מודיעין-מכבים-רעות",
  "נצרת",
  "לוד",
  "רעננה",
  "רמלה",
  "גבעתיים",
  "נהריה",
  "יבנה",
  "הוד השרון",
  "אור יהודה",
  "קריית גת",
  "עפולה",
  "קריית מוצקין",
  "נס ציונה",
  "אילת",
  "טבריה",
  "רהט",
  "רמת השרון",
  "כרמיאל",
  "אור עקיבא",
  "בית שאן",
  "מגדל העמק",
  "דימונה",
  "תמרה",
  "טירה",
  "שפרעם",
  "קלנסווה",
  "סחנין",
  "אום אל-פחם",
  "יפיע",
  "באקה אל-גרביה",
]

interface CityComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CityCombobox({ value, onChange, placeholder = "בחר עיר...", className }: CityComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-12", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="חפש עיר..." className="h-9" />
          <CommandList>
            <CommandEmpty>לא נמצאה עיר</CommandEmpty>
            <CommandGroup>
              {ISRAELI_CITIES.map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === city ? "opacity-100" : "opacity-0")} />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
