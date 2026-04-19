import { useRef, useEffect, useState, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { MAX_QUERY_LENGTH, EXAMPLE_QUERIES } from '../../lib/constants'

export default function QueryBar({ query, onChange, onSubmit, isLoading }) {
  const inputRef = useRef(null)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const historyRef = useRef([])
  const historyPosRef = useRef(-1)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % EXAMPLE_QUERIES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading) {
      if (query.trim().length >= 3) {
        historyRef.current = [query, ...historyRef.current.slice(0, 9)]
        historyPosRef.current = -1
        onSubmit(query)
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const history = historyRef.current
      if (!history.length) return
      const nextPos = Math.min(historyPosRef.current + 1, history.length - 1)
      historyPosRef.current = nextPos
      onChange(history[nextPos])
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextPos = Math.max(historyPosRef.current - 1, -1)
      historyPosRef.current = nextPos
      onChange(nextPos === -1 ? '' : historyRef.current[nextPos])
    }
  }, [query, isLoading, onSubmit, onChange])

  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-scout-text-3 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onChange(e.target.value.slice(0, MAX_QUERY_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={EXAMPLE_QUERIES[placeholderIdx]}
          disabled={isLoading}
          className="w-full h-14 pl-12 pr-4 bg-scout-surface border border-scout-border rounded-xl text-scout-text-1 placeholder:text-scout-text-3 text-sm font-sans focus:outline-none focus:border-scout-accent focus:ring-1 focus:ring-scout-accent/30 transition-all disabled:opacity-60"
        />
      </div>
      <button
        onClick={() => !isLoading && onSubmit(query)}
        disabled={isLoading || query.trim().length < 3}
        className="h-14 px-7 bg-scout-accent hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-heading font-semibold text-sm rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Scouting...
          </>
        ) : (
          'Scout'
        )}
      </button>
    </div>
  )
}
