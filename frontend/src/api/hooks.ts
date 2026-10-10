import { useMemo } from 'react'
import { useGetTaxonomy } from './generated/endpoints/taxonomy/taxonomy'

/** Справочники: грузятся один раз за сессию. */
export function useTaxonomy() {
  return useGetTaxonomy({ query: { staleTime: Infinity, gcTime: Infinity } })
}

export function useSkillNames(): (id: string) => string {
  const { data } = useTaxonomy()
  return useMemo(() => {
    const map = new Map((data?.skills ?? []).map((s) => [s.id, s.name]))
    return (id: string) => map.get(id) ?? id
  }, [data])
}
