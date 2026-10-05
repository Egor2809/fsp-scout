import { IconTools } from '@tabler/icons-react'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState } from '@/components/states'

export default function Soon() {
  return (
    <>
      <PageHeader eyebrow="Регулярные задания" title="Задания от компаний" />
      <EmptyState icon={<IconTools />} title="Раздел появится после хакатона" description="API уже описан в контракте, экран — в следующей итерации." />
    </>
  )
}
