"use client"

import { useEffect, useState } from "react"

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface SparkleEffectProps {
  active: boolean
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    // Random position around the edges and throughout
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 5 + Math.random() * 7, // 5-12px
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1, // 1-2s
  }))
}

export function SparkleEffect({ active }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    if (active) {
      setSparkles(generateSparkles(30))
    } else {
      setSparkles([])
    }
  }, [active])

  if (!active || sparkles.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="gold"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}
