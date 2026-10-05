import { useGetMyCompany } from '@/api/generated/endpoints/company/company'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { QueryView } from '@/components/states'
import { Tag } from '@/components/tags'
import { companySizeLabel, industryLabel } from '@/lib/labels'

export default function Company() {
  const query = useGetMyCompany()
  return (
    <QueryView query={query}>
      {(c) => (
        <div className="max-w-3xl">
          <PageHeader eyebrow="Профиль компании" title={c.name} description="Это видит кандидат в каждом инвайте." actions={c.verified ? <Tag tone="success">проверена</Tag> : <Tag tone="warning">на проверке</Tag>} />
          <Section title="О компании">
            <p className="mb-4 text-sm whitespace-pre-line">{c.description}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Отрасль</dt>
              <dd>{industryLabel[c.industry]}</dd>
              <dt className="text-muted-foreground">Размер</dt>
              <dd>{companySizeLabel[c.size]}</dd>
              <dt className="text-muted-foreground">Город</dt>
              <dd>{c.city ?? '—'}</dd>
              <dt className="text-muted-foreground">Сайт</dt>
              <dd>{c.website ?? '—'}</dd>
              <dt className="text-muted-foreground">Контакт для кандидатов</dt>
              <dd>{c.contact_email}</dd>
            </dl>
          </Section>
        </div>
      )}
    </QueryView>
  )
}
