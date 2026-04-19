import { TrendingUp, Clock } from 'lucide-react'
import { SORT_OPTIONS } from '../../lib/constants'

export default function SortToggle({ sortBy, onSort }) {
  return (
    <div className="flex items-center gap-1 bg-scout-surface border border-scout-border rounded-lg p-1">
      <button
        onClick={() => onSort(SORT_OPTIONS.SCORE)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
          sortBy === SORT_OPTIONS.SCORE
            ? 'bg-scout-accent text-white'
            : 'text-scout-text-3 hover:text-scout-text-2'
        }`}
      >
        <TrendingUp size={12} />
        By Score
      </button>
      <button
        onClick={() => onSort(SORT_OPTIONS.RECENCY)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
          sortBy === SORT_OPTIONS.RECENCY
            ? 'bg-scout-accent text-white'
            : 'text-scout-text-3 hover:text-scout-text-2'
        }`}
      >
        <Clock size={12} />
        By Recency
      </button>
    </div>
  )
}
