import { useState } from 'react'
import { useNavigate } from 'react-router'
import { IconSparkles } from '@tabler/icons-react'
import { useCreateNeed } from '@/api/generated/endpoints/needs/needs'
import { PageHeader } from '@/components/layout/AppShell'
import { ErrorBanner } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const EXAMPLE =
  'Ищем бэкенд-разработчика уровня middle на Go в платёжный сервис: PostgreSQL обязательно, желательно Kafka и k8s. Гибрид в Москве или удалёнка, 250–320 тысяч на руки.'

export default function NeedNew() {
  const [text, setText] = useState('')
  const create = useCreateNeed()
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl">
      <PageHeader motif eyebrow="Новая потребность" title="Кого ищете?" description="Опишите своими словами: стек, уровень, формат и вилку. Мы разберём текст на параметры — их можно поправить." />
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim().length < 10) return
          create.mutate({ data: { raw_text: text.trim() } }, { onSuccess: (need) => navigate(`/e/needs/${need.id}`) })
        }}
      >
        <Textarea aria-label="Описание потребности" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={EXAMPLE} maxLength={2000} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={text.trim().length < 10 || create.isPending}>
            <IconSparkles data-icon="inline-start" /> Разобрать
          </Button>
          <Button type="button" variant="ghost" onClick={() => setText(EXAMPLE)}>
            Подставить пример
          </Button>
        </div>
        {create.isError && <ErrorBanner error={create.error} />}
      </form>
    </div>
  )
}
