import { Link } from 'react-router'
import { IconSparkles, IconUsersGroup } from '@tabler/icons-react'
import { useListSearches } from '@/api/generated/endpoints/searches/searches'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, QueryView } from '@/components/states'
import { Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'

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
      <PageHeader eyebrow="Подборки" title="Ваши подборки" actions={<NewNeedButton />} />
      <QueryView query={query}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState icon={<IconUsersGroup />} title="Подборок пока нет" description="Опишите потребность текстом, и мы соберём подборку с объяснениями." action={<NewNeedButton />} />
          ) : (
            <ul className="grid gap-2">
              {list.map((s) => {
                const v = s.versions.find((x) => x.version === s.current_version)
                return (
                  <li key={s.id}>
                    <Link to={`/e/searches/${s.id}`} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4 text-foreground no-underline hover:border-primary/40">
                      <span className="font-heading font-semibold">{s.title}</span>
                      <Tag>v{s.current_version}</Tag>
                      <span className="text-sm text-muted-foreground">обновлена {formatDate(s.updated_at)}</span>
                      <span className="num ml-auto text-sm">
                        {v?.results_total ?? 0} кандидатов · в шорт-листе {s.shortlist.length}
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
