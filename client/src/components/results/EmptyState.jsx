import { Search } from 'lucide-react'

export default function EmptyState({ hasSearched, errorMessage }) {
  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-scout-surface border border-scout-border flex items-center justify-center mb-6">
          <Search size={28} className="text-scout-text-3" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-scout-text-1 mb-2">Find your next deal</h2>
        <p className="text-scout-text-2 text-sm max-w-md">
          Type an investment thesis in plain English. Scout reads real signals — hiring velocity, headcount growth, funding stage — and surfaces the best matches.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-scout-surface border border-scout-border flex items-center justify-center mb-6">
        <Search size={28} className="text-scout-text-3" />
      </div>
      <h2 className="font-heading text-xl font-bold text-scout-text-1 mb-2">
        {errorMessage ? 'Something went wrong' : 'No companies matched'}
      </h2>
      <p className="text-scout-text-2 text-sm max-w-sm">
        {errorMessage || 'Try broadening your query — add a sector, region, or stage to improve results.'}
      </p>
    </div>
  )
}
