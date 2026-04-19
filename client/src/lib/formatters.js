export function formatHeadcount(n) {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function formatRaised(usd) {
  if (!usd || usd === 0) return '—'
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`
  return `$${usd}`
}

export function formatGrowth(pct) {
  if (pct == null) return '—'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${Math.round(pct)}%`
}

export function formatYear(year) {
  if (!year) return '—'
  const age = new Date().getFullYear() - year
  return `${year} (${age}y)`
}

export function getScoreColor(score) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#0EA5E9'
  if (score >= 40) return '#F59E0B'
  return '#475569'
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'Solid'
  if (score >= 40) return 'Watch'
  return 'Weak'
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}
