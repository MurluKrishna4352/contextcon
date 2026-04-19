import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from '../../lib/constants'

export default function SignalBadge({ label }) {
  const colorClass = BADGE_COLORS[label] || DEFAULT_BADGE_COLOR
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${colorClass}`}>
      {label}
    </span>
  )
}
