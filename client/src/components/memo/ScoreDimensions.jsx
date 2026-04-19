import { getScoreColor } from '../../lib/formatters'

const DIMENSIONS = [
  { key: 'headcountGrowth', label: 'Headcount Growth', max: 30 },
  { key: 'hiringVelocity', label: 'Hiring Velocity', max: 25 },
  { key: 'fundingStageFit', label: 'Funding Stage Fit', max: 25 },
  { key: 'marketSignal', label: 'Market Signal', max: 20 },
]

export default function ScoreDimensions({ scoutScore }) {
  if (!scoutScore) return null

  return (
    <div className="flex flex-col gap-3">
      {DIMENSIONS.map(({ key, label, max }) => {
        const value = scoutScore[key] ?? 0
        const pct = (value / max) * 100
        const color = getScoreColor((value / max) * 100)

        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-scout-text-2">{label}</span>
              <span className="text-scout-text-1">{value}<span className="text-scout-text-3">/{max}</span></span>
            </div>
            <div className="h-1.5 bg-scout-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
