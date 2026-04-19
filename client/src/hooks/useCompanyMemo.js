import { useQuery } from '@tanstack/react-query'
import { fetchCompanyMemo } from '../lib/api'

export function useCompanyMemo(domain) {
  return useQuery({
    queryKey: ['memo', domain],
    queryFn: () => fetchCompanyMemo(domain),
    enabled: !!domain,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  })
}
