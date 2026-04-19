import { useQuery } from '@tanstack/react-query'
import { Zap } from 'lucide-react'
import { fetchHealth } from '../../lib/api'

export default function Header({ queryCount }) {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30000,
    retry: false,
  })

  const isConnected = health?.status === 'ok'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-scout-border bg-scout-surface/80 backdrop-blur-md flex items-center px-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-scout-accent flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-heading text-lg font-bold text-scout-text-1 tracking-tight">Scout AI</span>
        </div>
        <span className="text-scout-text-3 text-xs font-mono hidden sm:block">AI-Powered VC Intelligence</span>
      </div>

      <div className="flex items-center gap-4">
        {queryCount > 0 && (
          <span className="text-xs font-mono text-scout-text-3 bg-scout-surface-2 border border-scout-border px-2 py-1 rounded">
            {queryCount} {queryCount === 1 ? 'query' : 'queries'}
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-scout-success' : 'bg-scout-text-3'} ${isConnected ? 'shadow-[0_0_6px_#10B981]' : ''}`} />
          <span className="text-xs text-scout-text-3 font-mono">
            {isConnected ? 'Live' : 'Connecting'}
          </span>
        </div>
      </div>
    </header>
  )
}
