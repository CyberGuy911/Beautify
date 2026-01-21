"use client"

import { useEffect, useState } from "react"

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  type: 'star' | 'circle' | 'diamond'
  color: string
}

interface SparkleEffectProps {
  active: boolean
}

const COLORS = [
  '#d4af37', // gold
  '#f5d97e', // light gold
  '#b87333', // copper
  '#ffffff', // white
  '#e5c158', // bright gold
]

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 120 - 10, // Allow overflow
    y: Math.random() * 120 - 10,
    size: 4 + Math.random() * 10,
    delay: Math.random() * 0.8,
    duration: 0.8 + Math.random() * 1.2,
    type: ['star', 'circle', 'diamond'][Math.floor(Math.random() * 3)] as Sparkle['type'],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

function SparkleShape({ type, color }: { type: Sparkle['type'], color: string }) {
  if (type === 'star') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path
          d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
          fill={color}
        />
      </svg>
    )
  }

  if (type === 'diamond') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path
          d="M12 0L24 12L12 24L0 12L12 0Z"
          fill={color}
        />
      </svg>
    )
  }

  return (
    <div
      className="w-full h-full rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export function SparkleEffect({ active }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    if (active) {
      setSparkles(generateSparkles(40))
    } else {
      setSparkles([])
    }
  }, [active])

  if (!active || sparkles.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
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
            filter: `drop-shadow(0 0 ${sparkle.size / 2}px ${sparkle.color})`,
          }}
        >
          <SparkleShape type={sparkle.type} color={sparkle.color} />
        </div>
      ))}
    </div>
  )
}
