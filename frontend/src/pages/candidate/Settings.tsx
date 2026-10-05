import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/AppShell'
import { ConsentsForm } from '@/components/onboarding'

export default function Settings() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Аккаунт" title="Согласия" description="Каждое согласие отзывается отдельно. Без согласия на показ профиль скроется из подбора, уже принятые инвайты сохранятся." />
      <ConsentsForm submitLabel="Сохранить согласия" onDone={() => toast.success('Согласия обновлены')} />
    </div>
  )
}
