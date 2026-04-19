import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { getScoreColor, getScoreLabel } from '../../lib/formatters'

export default function ScoreRing({ score, size = 72, strokeWidth = 6 }) {
  const shouldReduce = useReducedMotion()
  const circleRef = useRef(null)
  const safeScore = score ?? 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeScore / 100) * circumference
  const color = getScoreColor(safeScore)
  const label = getScoreLabel(safeScore)

  useEffect(() => {
    if (shouldReduce || !circleRef.current) return
    circleRef.current.style.strokeDashoffset = circumference.toString()
    circleRef.current.style.transition = 'none'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!circleRef.current) return
        circleRef.current.style.transition = 'stroke-dashoffset 800ms ease-out'
        circleRef.current.style.strokeDashoffset = offset.toString()
      })
    })
  }, [safeScore, circumference, offset, shouldReduce])

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={shouldReduce ? offset : circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-medium text-scout-text-1" style={{ fontSize: size * 0.22 }}>
            {safeScore}
          </span>
        </div>
      </div>
      <span className="text-xs font-mono text-scout-text-3">{label}</span>
    </div>
  )
}
