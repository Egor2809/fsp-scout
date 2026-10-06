import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/AppShell'
import { ConsentsForm } from '@/components/onboarding'

export default function Settings() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Согласия" />
      <ConsentsForm submitLabel="Сохранить согласия" onDone={() => toast.success('Согласия обновлены')} />
    </div>
  )
}
