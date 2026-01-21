"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        disabled
        className="w-10 h-10 rounded-xl flex items-center justify-center opacity-0"
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center
        bg-transparent border border-accent/20 hover:border-accent/40
        hover:bg-accent/5 transition-all duration-300 group animate-fade-in"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-accent/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icons */}
      <Sun className="h-5 w-5 text-accent/70 group-hover:text-accent rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 text-accent/70 group-hover:text-accent rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />

      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
