export default function SkeletonCard() {
  return (
    <div className="bg-scout-surface border border-scout-border rounded-xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-scout-surface-2" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-scout-surface-2 rounded" />
            <div className="h-3 w-20 bg-scout-surface-2 rounded" />
          </div>
        </div>
        <div className="w-16 h-16 rounded-full bg-scout-surface-2" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-scout-surface-2 rounded-full" />
        <div className="h-5 w-16 bg-scout-surface-2 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-10 bg-scout-surface-2 rounded" />
        <div className="h-10 bg-scout-surface-2 rounded" />
        <div className="h-10 bg-scout-surface-2 rounded" />
      </div>
      <div className="h-9 bg-scout-surface-2 rounded-lg" />
    </div>
  )
}
