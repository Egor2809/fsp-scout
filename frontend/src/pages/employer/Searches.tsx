import { Link } from 'react-router'
import { IconSparkles, IconUsersGroup } from '@tabler/icons-react'
import { useListSearches } from '@/api/generated/endpoints/searches/searches'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'

export function NewNeedButton() {
  return (
    <Button asChild>
      <Link to="/e/needs/new">
        <IconSparkles data-icon="inline-start" /> Новая потребность
      </Link>
    </Button>
  )
}

export default function Searches() {
  const query = useListSearches()
  return (
    <>
      <PageHeader title="Ваши подборки" actions={<NewNeedButton />} />
      <QueryView query={query}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState icon={<IconUsersGroup />} title="Подборок пока нет" action={<NewNeedButton />} />
          ) : (
            <ul className="grid max-w-3xl divide-y border-y">
              {list.map((s) => {
                const v = s.versions.find((x) => x.version === s.current_version)
                return (
                  <li key={s.id}>
                    <Link to={`/e/searches/${s.id}`} className="flex flex-wrap items-center gap-3 py-5 text-foreground no-underline hover:text-link">
                      <span className="font-heading font-semibold">{s.title}</span>
                      <span className="num ml-auto text-sm">
                        {v?.results_total ?? 0} в подборке{s.shortlist.length ? ` · шорт-лист ${s.shortlist.length}` : ''}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )
        }
      </QueryView>
    </>
  )
}
