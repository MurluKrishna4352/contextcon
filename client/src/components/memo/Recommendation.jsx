const STYLES = {
  'Reach out now': 'bg-scout-success/10 border-scout-success/30 text-scout-success',
  'Monitor for 30 days': 'bg-scout-warning/10 border-scout-warning/30 text-scout-warning',
  'Pass at this stage': 'bg-scout-text-3/10 border-scout-text-3/30 text-scout-text-2',
}

export default function Recommendation({ recommendation, rationale }) {
  if (!recommendation) return null
  const style = STYLES[recommendation] || STYLES['Monitor for 30 days']

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1.5 ${style}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wide opacity-70">Recommendation</span>
      </div>
      <p className="font-heading font-bold text-lg">{recommendation}</p>
      {rationale && <p className="text-sm opacity-80 leading-relaxed">{rationale}</p>}
    </div>
  )
}
