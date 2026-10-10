import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMyTask, useSubmitTask } from '@/api/generated/endpoints/tasks/tasks'
import type { TaskAssignment } from '@/api/generated/model'
import { errorMessage } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { CodeEditor } from '@/components/CodeEditor'
import { TaskContent, SubmissionContent } from '@/components/TaskContent'
import { PageHeader } from '@/components/layout/AppShell'
import { InlineError, QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { buildTaskSubmission } from '@/lib/taskForms'

function Solution({ assignment }: { assignment: TaskAssignment }) {
  const { task } = assignment
  const qc = useQueryClient()
  const submit = useSubmitTask()
  const [text, setText] = useState('')
  const [code, setCode] = useState(task.starter_code ?? '')
  const [error, setError] = useState<string | null>(null)
  const submission = assignment.submission ?? submit.data
  if (submission) return <section className="grid gap-4" aria-label="Моё решение"><h2 className="text-xl">Моё решение</h2><SubmissionContent submission={submission} /></section>
  if (assignment.status !== 'assigned' || task.status !== 'active' || Date.parse(assignment.due_at) <= Date.now() || Date.parse(task.deadline_at) <= Date.now()) return <p role="status">Приём решений завершён.</p>
  return <form className="grid gap-4" onSubmit={async e => {
    e.preventDefault()
    setError(null)
    try {
      const data = buildTaskSubmission(task.kind, task.language, text, code)
      await submit.mutateAsync({ taskId: task.id, data })
      await invalidatePaths(qc, '/me/tasks', '/me/profile', '/me/card-preview')
    } catch (cause) { setError(errorMessage(cause)) }
  }}>
    <h2 className="text-xl">Ваше решение</h2>
    {task.kind === 'code' && <CodeEditor initial={task.starter_code ?? ''} language={task.language} onChange={setCode} readOnly={submit.isPending} ariaLabel="Код решения" />}
    <label className="grid gap-2">{task.kind === 'code' ? 'Пояснение к решению (необязательно)' : 'Решение'}<Textarea className="min-h-40" value={text} onChange={e => setText(e.target.value)} maxLength={4000} required={task.kind !== 'code'} disabled={submit.isPending} /></label>
    <p className="text-sm text-muted-foreground">После отправки изменить решение нельзя. Работодатель оценит его по указанным критериям.</p>
    <InlineError>{error}</InlineError>
    <Button type="submit" className="justify-self-start" disabled={submit.isPending}>{submit.isPending ? 'Отправка…' : 'Отправить решение'}</Button>
  </form>
}

export default function CandidateTask() {
  const { taskId = '' } = useParams()
  const query = useGetMyTask(taskId, { query: { enabled: Boolean(taskId), refetchInterval: 15_000 } })
  return <div className="grid max-w-3xl gap-6">
    <Link to="/c/tasks">← Все задания</Link>
    <QueryView query={query}>{a => <>
      <PageHeader title={a.task.title} />
      <p>Срок сдачи: {new Date(a.due_at).toLocaleString('ru-RU')}</p>
      <TaskContent task={a.task} showStarter={a.task.kind !== 'code'} />
      <Solution key={a.task.id} assignment={a} />
    </>}</QueryView>
  </div>
}
