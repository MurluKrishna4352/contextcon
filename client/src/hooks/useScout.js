import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchScoutResults } from '../lib/api'
import { SORT_OPTIONS } from '../lib/constants'

export function useScout() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.SCORE)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['scout', submittedQuery],
    queryFn: () => fetchScoutResults(submittedQuery),
    enabled: submittedQuery.length >= 3,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const submit = useCallback((q) => {
    const trimmed = (q || query).trim()
    if (trimmed.length >= 3) {
      setSubmittedQuery(trimmed)
    }
  }, [query])

  const companies = data?.companies ?? []
  const interpretedFilters = data?.interpretedFilters ?? null
  const totalCount = data?.totalCount ?? 0

  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortBy === SORT_OPTIONS.RECENCY) {
      const aDate = a.lastFundingDate ? new Date(a.lastFundingDate) : new Date(0)
      const bDate = b.lastFundingDate ? new Date(b.lastFundingDate) : new Date(0)
      return bDate - aDate
    }
    return b.scoutScore.total - a.scoutScore.total
  })

  return {
    query,
    setQuery,
    submittedQuery,
    sortBy,
    setSortBy,
    submit,
    companies: sortedCompanies,
    interpretedFilters,
    totalCount,
    isLoading,
    isError,
    error,
    refetch,
    hasResults: companies.length > 0,
    hasSearched: submittedQuery.length > 0,
  }
}
