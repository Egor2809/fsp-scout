import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateCompanyTask, useListCompanyTasks } from '@/api/generated/endpoints/tasks/tasks'
import { errorMessage } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { ChipMultiSelect } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, InlineError, QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { codeLanguageLabel, GRADES, gradeLabel, SPECIALIZATIONS, specializationLabel, taskKindLabel } from '@/lib/labels'
import { buildTaskInput, type TaskDraft } from '@/lib/taskForms'

const selectClass = 'h-10 w-full rounded-lg border bg-background px-3 text-sm'
const initialDraft = (): TaskDraft => ({ title: '', description: '', kind: 'approach', specializations: ['backend'], grades: ['middle'], minutes: '15',
  language: 'python', starter: '', deadline: '', rubric: [{ criterion: 'Корректность решения', percent: '70' }, { criterion: 'Обработка граничных случаев', percent: '30' }] })

function CreateTask({ onCancel }: { onCancel: () => void }) {
  const create = useCreateCompanyTask()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(initialDraft)
  const [error, setError] = useState<string | null>(null)
  const update = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft(d => ({ ...d, [key]: value }))
  const weight = draft.rubric.reduce((sum, r) => sum + (Number(r.percent) || 0), 0)
  return <form onSubmit={async e => {
    e.preventDefault()
    setError(null)
    try {
      const task = await create.mutateAsync({ data: buildTaskInput(draft) })
      await invalidatePaths(qc, '/regular-tasks', '/me/tasks')
      navigate(`/e/tasks/${task.id}`)
    } catch (cause) { setError(errorMessage(cause)) }
  }}>
    <fieldset disabled={create.isPending} className="grid min-w-0 max-w-3xl gap-5 rounded-lg border p-4 sm:p-6">
      <legend className="px-2 text-xl">Новое задание</legend>
      <label className="grid gap-2">Название<Input value={draft.title} onChange={e => update('title', e.target.value)} required minLength={5} maxLength={120} /></label>
      <label className="grid gap-2">Условие задания<Textarea className="min-h-32" value={draft.description} onChange={e => update('description', e.target.value)} required minLength={30} maxLength={4000} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">Формат<select className={selectClass} value={draft.kind} onChange={e => update('kind', e.target.value as TaskDraft['kind'])}>{(['approach', 'review', 'code'] as const).map(k => <option key={k} value={k}>{taskKindLabel[k]}</option>)}</select></label>
        <label className="grid gap-2">Время выполнения, минут<Input type="number" min={5} max={30} step={1} required value={draft.minutes} onChange={e => update('minutes', e.target.value)} /></label>
      </div>
      <div className="grid gap-2"><p className="font-medium">Специализации</p><ChipMultiSelect options={SPECIALIZATIONS.map(value => ({ value, label: specializationLabel[value] }))} value={draft.specializations} onChange={value => update('specializations', value)} ariaLabel="Специализации задания" min={1} /></div>
      <div className="grid gap-2"><p className="font-medium">Грейды</p><ChipMultiSelect options={GRADES.map(value => ({ value, label: gradeLabel[value] }))} value={draft.grades} onChange={value => update('grades', value)} ariaLabel="Грейды задания" min={1} /></div>
      {draft.kind !== 'approach' && <>
        <label className="grid gap-2">Язык<select className={selectClass} value={draft.language} onChange={e => update('language', e.target.value as TaskDraft['language'])}>{(['python', 'javascript', 'typescript', 'go', 'java', 'sql', 'yaml'] as const).map(lang => <option key={lang} value={lang}>{codeLanguageLabel[lang]}</option>)}</select></label>
        <label className="grid gap-2">{draft.kind === 'review' ? 'Фрагмент для ревью' : 'Начальный код (необязательно)'}<Textarea className="min-h-32 font-mono" value={draft.starter} onChange={e => update('starter', e.target.value)} required={draft.kind === 'review'} maxLength={10000} /></label>
      </>}
      <label className="grid gap-2">Срок сдачи (ваше местное время)<Input type="datetime-local" required value={draft.deadline} onChange={e => update('deadline', e.target.value)} /></label>
      <fieldset className="grid gap-3"><legend className="mb-3 font-medium">Критерии оценки · всего {weight}%</legend>
        {draft.rubric.map((r, i) => <div key={i} className="grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-end">
          <label className="grid gap-1 text-sm">Критерий {i + 1}<Input value={r.criterion} minLength={3} maxLength={200} required onChange={e => update('rubric', draft.rubric.map((item, j) => i === j ? { ...item, criterion: e.target.value } : item))} /></label>
          <label className="grid gap-1 text-sm">Вес, %<Input type="number" min={0} max={100} step="any" value={r.percent} required onChange={e => update('rubric', draft.rubric.map((item, j) => i === j ? { ...item, percent: e.target.value } : item))} /></label>
          <Button type="button" variant="ghost" disabled={draft.rubric.length === 1} aria-label={`Удалить критерий ${i + 1}`} onClick={() => update('rubric', draft.rubric.filter((_, j) => i !== j))}>Удалить</Button>
        </div>)}
        <Button type="button" variant="outline" className="justify-self-start" disabled={draft.rubric.length >= 6} onClick={() => update('rubric', [...draft.rubric, { criterion: '', percent: '0' }])}>Добавить критерий</Button>
      </fieldset>
      <p className="text-sm text-muted-foreground">После публикации задание будет назначено подходящим кандидатам. Изменение опубликованного задания пока не поддерживается.</p>
      <InlineError>{error}</InlineError>
      <Button type="submit" className="justify-self-start" disabled={create.isPending}>{create.isPending ? 'Публикация…' : 'Опубликовать задание'}</Button>
      <Button type="button" variant="ghost" className="justify-self-start" onClick={onCancel}>Отменить</Button>
    </fieldset>
  </form>
}

export default function EmployerTasks() {
  const query = useListCompanyTasks({ query: { refetchInterval: 30_000 } })
  const [creating, setCreating] = useState(false)
  return <div className="grid gap-6">
    <PageHeader title="Регулярные задания" />
    {!creating && <Button className="justify-self-start" onClick={() => setCreating(true)}>Создать задание</Button>}
    {creating && <CreateTask onCancel={() => setCreating(false)} />}
    <QueryView query={query}>{list => !list.length
      ? <EmptyState title="Заданий пока нет" description="Опубликуйте небольшое задание с понятными критериями оценки." />
      : <ul className="grid max-w-3xl gap-4">{list.map(task => <li key={task.id}><Link to={`/e/tasks/${task.id}`} className="grid gap-2 rounded-lg border bg-card p-5 no-underline hover:border-primary/50">
        <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{task.title}</h2><span className="text-sm">{task.status === 'active' ? 'Приём решений' : 'Закрыто'}</span></div>
        <p className="text-sm text-muted-foreground">{taskKindLabel[task.kind]} · {task.time_limit_min} мин. · назначено: {task.assigned_count ?? 0} · решений: {task.submissions_count ?? 0}</p>
        <p className="text-sm">Срок сдачи: {new Date(task.deadline_at).toLocaleString('ru-RU')}</p>
      </Link></li>)}</ul>}
    </QueryView>
  </div>
}
