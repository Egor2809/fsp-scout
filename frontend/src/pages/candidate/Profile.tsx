import { useGetMyCardPreview, useGetMyProfile } from '@/api/generated/endpoints/profile/profile'
import { CandidateCardView, ContactList, Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { QueryView } from '@/components/states'
import { Tag } from '@/components/tags'
import { formatDate, formatSalaryRange, formatYears } from '@/lib/format'
import { industryLabel, specializationLabel, workFormatLabel } from '@/lib/labels'

const VISIBILITY = {
  visible: { tone: 'success', text: 'Виден в подборе' },
  hidden_no_grade: { tone: 'warning', text: 'Скрыт: нет подтверждённого грейда' },
  hidden_no_consent: { tone: 'warning', text: 'Скрыт: нет согласия на показ' },
  hidden_by_candidate: { tone: 'muted', text: 'Скрыт вами' },
} as const

export default function CandidateProfile() {
  const profile = useGetMyProfile()
  const preview = useGetMyCardPreview()
  return (
    <>
      <PageHeader eyebrow="Профиль" title="Профиль и карточка" description="Слева — ваши данные. Справа — анонимная карточка, которую видит работодатель до принятия инвайта." />
      <div className="grid gap-5 lg:grid-cols-2">
        <QueryView query={profile}>
          {(p) => (
            <div className="grid content-start gap-4">
              <Section title="Данные" actions={<Tag tone={VISIBILITY[p.visibility].tone}>{VISIBILITY[p.visibility].text}</Tag>}>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Специализация</dt>
                  <dd>{p.specialization ? specializationLabel[p.specialization] : '—'}</dd>
                  <dt className="text-muted-foreground">Стаж</dt>
                  <dd>{formatYears(p.experience_years)}</dd>
                  <dt className="text-muted-foreground">Формат</dt>
                  <dd>{p.work_formats.map((f) => workFormatLabel[f]).join(', ') || '—'}</dd>
                  <dt className="text-muted-foreground">Отрасли</dt>
                  <dd>{p.industries.map((i) => industryLabel[i]).join(', ') || '—'}</dd>
                  <dt className="text-muted-foreground">Город</dt>
                  <dd>
                    {p.city ?? '—'}
                    {p.relocation ? ', готов к переезду' : ''}
                  </dd>
                  <dt className="text-muted-foreground">Ожидания</dt>
                  <dd className="num">{formatSalaryRange(p.salary_expectation)}</dd>
                  <dt className="text-muted-foreground">Обновлён</dt>
                  <dd>{formatDate(p.updated_at)}</dd>
                </dl>
              </Section>
              <Section title="Контакты (скрыты от компаний)">
                <ContactList contacts={{ full_name: p.full_name, email: p.email, phone: p.phone, telegram: p.telegram, preferred_channel: p.telegram ? 'telegram' : 'email' }} />
              </Section>
              {p.about && (
                <Section title="О себе">
                  <p className="text-sm whitespace-pre-line">{p.about}</p>
                </Section>
              )}
            </div>
          )}
        </QueryView>
        <QueryView query={preview}>
          {(card) => (
            <div className="rounded-lg border border-dashed p-4">
              <p className="eyebrow mb-3">Так вас видит работодатель</p>
              <CandidateCardView card={card} />
            </div>
          )}
        </QueryView>
      </div>
    </>
  )
}
