import CompanyCard from './CompanyCard'
import SkeletonCard from './SkeletonCard'
import EmptyState from './EmptyState'

export default function ResultsGrid({ companies, isLoading, isError, error, hasSearched, onViewMemo }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (isError || (hasSearched && companies.length === 0)) {
    return (
      <EmptyState
        hasSearched={hasSearched}
        errorMessage={error?.response?.data?.error || error?.message || null}
      />
    )
  }

  if (!hasSearched) {
    return <EmptyState hasSearched={false} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company, index) => (
        <CompanyCard
          key={company.id || company.domain || index}
          company={company}
          index={index}
          onViewMemo={onViewMemo}
        />
      ))}
    </div>
  )
}
