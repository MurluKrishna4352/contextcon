import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react'
import ScoreRing from './ScoreRing'
import SignalBadge from './SignalBadge'
import { formatHeadcount, formatRaised, formatGrowth, formatYear, getInitials } from '../../lib/formatters'

function CompanyLogo({ logoUrl, name }) {
  const [errored, setErrored] = useState(false)

  if (!logoUrl || errored) {
    return (
      <div className="w-12 h-12 rounded-full bg-scout-accent/20 border border-scout-accent/30 flex items-center justify-center flex-shrink-0">
        <span className="font-heading font-bold text-scout-accent text-sm">{getInitials(name)}</span>
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      width={48}
      height={48}
      loading="lazy"
      onError={() => setErrored(true)}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-scout-surface-2"
    />
  )
}

export default function CompanyCard({ company, index, onViewMemo }) {
  const growth6m = company.headcountGrowth?.sixMonths
  const growth1y = company.headcountGrowth?.oneYear
  const location = [company.location?.city, company.location?.country].filter(Boolean).join(', ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className="bg-scout-surface border border-scout-border rounded-xl p-5 flex flex-col gap-4 hover:border-scout-accent/50 transition-colors group cursor-default"
      style={{ willChange: 'transform' }}
      onAnimationComplete={e => {
        if (e.opacity === 1) e.target && (e.target.style.willChange = 'auto')
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo logoUrl={company.logoUrl} name={company.name} />
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-scout-text-1 text-base leading-tight truncate">
              {company.name ?? '—'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-scout-text-3 bg-scout-surface-2 px-2 py-0.5 rounded border border-scout-border">
                {company.industry ?? '—'}
              </span>
            </div>
          </div>
        </div>
        <ScoreRing score={company.scoutScore?.total ?? 0} size={72} />
      </div>

      {/* Location & Founded */}
      <div className="flex items-center gap-4 text-xs text-scout-text-3 font-mono">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {location}
          </span>
        )}
        {company.foundedYear && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatYear(company.foundedYear)}
          </span>
        )}
      </div>

      {/* Signal badges */}
      {company.signalBadges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {company.signalBadges.slice(0, 4).map(badge => (
            <SignalBadge key={badge} label={badge} />
          ))}
        </div>
      )}

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 border-t border-scout-border pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-scout-text-3 font-mono">Headcount</span>
          <span className="text-sm font-mono font-medium text-scout-text-1">{formatHeadcount(company.headcount)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-scout-text-3 font-mono">6M Growth</span>
          <span className={`text-sm font-mono font-medium ${growth6m > 0 ? 'text-scout-success' : growth6m < 0 ? 'text-scout-danger' : 'text-scout-text-2'}`}>
            {formatGrowth(growth6m)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-scout-text-3 font-mono">Raised</span>
          <span className="text-sm font-mono font-medium text-scout-text-1">{formatRaised(company.totalRaised)}</span>
        </div>
      </div>

      {/* Headline */}
      {company.headline && (
        <p className="text-xs text-scout-text-2 leading-relaxed line-clamp-2">{company.headline}</p>
      )}

      {/* View Memo CTA */}
      <button
        onClick={() => onViewMemo(company)}
        className="w-full h-9 border border-scout-border hover:border-scout-accent text-scout-text-2 hover:text-scout-accent text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 group-hover:border-scout-accent/50"
      >
        View Investment Memo
        <ArrowUpRight size={12} />
      </button>
    </motion.div>
  )
}
