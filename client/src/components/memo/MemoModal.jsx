import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useCompanyMemo } from '../../hooks/useCompanyMemo'
import ScoreRing from '../results/ScoreRing'
import SignalBadge from '../results/SignalBadge'
import ScoreDimensions from './ScoreDimensions'
import MemoSection from './MemoSection'
import Recommendation from './Recommendation'
import { getInitials } from '../../lib/formatters'

function CompanyAvatar({ logoUrl, name, size = 64 }) {
  const [errored, setErrored] = useState(false)

  if (!logoUrl || errored) {
    return (
      <div
        className="rounded-full bg-scout-accent/20 border border-scout-accent/30 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="font-heading font-bold text-scout-accent" style={{ fontSize: size * 0.3 }}>
          {getInitials(name)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      className="rounded-full object-cover flex-shrink-0 bg-scout-surface-2"
      style={{ width: size, height: size }}
    />
  )
}

export default function MemoModal({ company, onClose }) {
  const domain = company?.domain
  const { data, isLoading, isError, error, refetch } = useCompanyMemo(domain)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const memo = data?.memo
  const enrichedCompany = data?.company || company

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-2xl max-h-[90vh] bg-scout-surface border border-scout-border rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-start gap-4 p-6 border-b border-scout-border flex-shrink-0">
            <CompanyAvatar logoUrl={company.logoUrl} name={company.name} size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-heading font-bold text-xl text-scout-text-1 truncate">{company.name}</h2>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-scout-accent hover:text-scout-accent-2 font-mono mt-0.5 transition-colors"
                    >
                      {company.domain}
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-scout-border hover:border-scout-text-3 flex items-center justify-center text-scout-text-3 hover:text-scout-text-2 transition-all flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {company.signalBadges?.slice(0, 4).map(badge => (
                  <SignalBadge key={badge} label={badge} />
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <ScoreRing score={enrichedCompany?.scoutScore?.total ?? company?.scoutScore?.total ?? 0} size={88} strokeWidth={7} />
            </div>
          </div>

          {/* Score dimensions */}
          <div className="px-6 pt-4 pb-2 border-b border-scout-border flex-shrink-0">
            <ScoreDimensions scoutScore={enrichedCompany?.scoutScore || company?.scoutScore} />
          </div>

          {/* Memo Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="flex items-center gap-2 text-scout-accent">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="font-mono text-sm">Claude is reading signals...</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-scout-accent animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <p className="text-scout-danger text-sm font-mono">
                  {error?.response?.data?.error || 'Failed to generate memo'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 px-4 py-2 border border-scout-border rounded-lg text-xs font-mono text-scout-text-2 hover:text-scout-text-1 hover:border-scout-text-3 transition-all"
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            )}

            {memo && (
              <div className="flex flex-col gap-6">
                <MemoSection title="Company Overview" content={memo.overview} />
                <MemoSection title="Investment Thesis" content={memo.thesis} />
                <MemoSection title="Hiring Analysis" content={memo.hiring} />
                <MemoSection title="Funding History" content={memo.funding} />
                <MemoSection title="Growth Signals" content={memo.signals} />
                {memo.redFlags && memo.redFlags !== '—' && (
                  <div className="flex flex-col gap-2">
                    <h4 className="font-heading font-semibold text-scout-warning text-sm">Red Flags</h4>
                    <p className="text-scout-text-2 text-sm leading-relaxed">{memo.redFlags}</p>
                  </div>
                )}
                <Recommendation
                  recommendation={memo.recommendation}
                  rationale={memo.recommendationRationale}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
