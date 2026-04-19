export default function MemoSection({ title, content }) {
  if (!content || content === '—') return null

  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-heading font-semibold text-scout-text-1 text-sm">{title}</h4>
      <p className="text-scout-text-2 text-sm leading-relaxed">{content}</p>
    </div>
  )
}
