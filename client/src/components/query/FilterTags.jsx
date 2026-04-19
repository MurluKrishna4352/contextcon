export default function FilterTags({ filters }) {
  if (!filters) return null

  const tags = []

  if (filters.vc_intent) {
    tags.push({ label: 'Intent', value: filters.vc_intent })
  }

  for (const f of filters.filters || []) {
    const values = Array.isArray(f.value) ? f.value.join(', ') : f.value
    const label = f.filter_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    tags.push({ label, value: values })
  }

  if (!tags.length) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-scout-accent/10 border border-scout-accent/20 text-scout-accent-2"
        >
          <span className="text-scout-text-3">{tag.label}:</span>
          {tag.value}
        </span>
      ))}
    </div>
  )
}
