import { useState, Suspense, lazy } from 'react'
import Header from './components/layout/Header'
import AppShell from './components/layout/AppShell'
import QueryBar from './components/query/QueryBar'
import FilterTags from './components/query/FilterTags'
import SortToggle from './components/query/SortToggle'
import ResultsGrid from './components/results/ResultsGrid'
import { useScout } from './hooks/useScout'

const MemoModal = lazy(() => import('./components/memo/MemoModal'))

export default function App() {
  const {
    query, setQuery, sortBy, setSortBy,
    submit, companies, interpretedFilters,
    totalCount, isLoading, isError, error,
    refetch, hasSearched,
  } = useScout()

  const [queryCount, setQueryCount] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState(null)

  function handleSubmit(q) {
    setQueryCount(c => c + 1)
    submit(q)
  }

  return (
    <AppShell>
      <Header queryCount={queryCount} />

      {/* Query Panel */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-scout-text-1 mb-2">
            Find your next investment
          </h1>
          <p className="text-scout-text-2 text-sm">
            Describe your thesis in plain English. Scout reads live signals across thousands of companies.
          </p>
        </div>

        <QueryBar
          query={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {interpretedFilters && (
          <FilterTags filters={interpretedFilters} />
        )}

        {hasSearched && !isLoading && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-mono text-scout-text-3">
              {totalCount > 0
                ? `Showing ${totalCount} ${totalCount === 1 ? 'company' : 'companies'}`
                : 'No companies matched'}
            </span>
            <SortToggle sortBy={sortBy} onSort={setSortBy} />
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <ResultsGrid
          companies={companies}
          isLoading={isLoading}
          isError={isError}
          error={error}
          hasSearched={hasSearched}
          onViewMemo={setSelectedCompany}
        />
      </div>

      {/* Memo Modal */}
      <Suspense fallback={null}>
        {selectedCompany && (
          <MemoModal
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </Suspense>
    </AppShell>
  )
}
