export const MAX_QUERY_LENGTH = 300
export const MIN_QUERY_LENGTH = 3

export const EXAMPLE_QUERIES = [
  'Find me pre-Series A SaaS companies in India hiring engineers fast',
  'B2B fintech startups in Southeast Asia with < $10M raised and growing headcount',
  'Climate tech companies in the US with recent C-suite hires',
  'Enterprise software companies 50-200 employees expanding internationally',
]

export const SORT_OPTIONS = {
  SCORE: 'score',
  RECENCY: 'recency',
}

export const BADGE_COLORS = {
  'Hiring Fast': 'bg-scout-accent/20 text-scout-accent-2 border-scout-accent/30',
  'High Growth': 'bg-scout-success/20 text-scout-success border-scout-success/30',
  'Recent Funding': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Exec Hire': 'bg-scout-warning/20 text-scout-warning border-scout-warning/30',
  'Pre-Seed': 'bg-scout-text-3/20 text-scout-text-2 border-scout-text-3/30',
  'Seed Stage': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Series A': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Series B': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Series B+': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Early Stage': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Scaling Fast': 'bg-scout-success/20 text-scout-success border-scout-success/30',
  'Strong Signal': 'bg-scout-accent/20 text-scout-accent-2 border-scout-accent/30',
}

export const DEFAULT_BADGE_COLOR = 'bg-scout-surface-2 text-scout-text-2 border-scout-border'
