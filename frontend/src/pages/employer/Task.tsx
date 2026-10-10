import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useGetCompanyTask, useListTaskSubmissions, useScoreTaskSubmission } from '@/api/generated/endpoints/tasks/tasks'
import type { EmployerTaskSubmission } from '@/api/generated/model'
import { errorMessage } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { CandidateHeadline } from '@/components/candidate'
import { SubmissionContent, TaskContent } from '@/components/TaskContent'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, InlineError, QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { buildTaskScore } from '@/lib/taskForms'

function Review({ submission }: { submission: EmployerTaskSubmission }) {
  const score = useScoreTaskSubmission()
  const qc = useQueryClient()
  const [value, setValue] = useState(submission.final_score?.toString() ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [error, setError] = useState<string | null>(null)
  return <article className="grid min-w-0 gap-4 border-t py-6">
    <CandidateHeadline card={submission.candidate} />
    <p className="text-sm text-muted-foreground">Отправлено: {new Date(submission.submitted_at).toLocaleString('ru-RU')}</p>
    <SubmissionContent submission={submission} />
    <form className="grid gap-3" onSubmit={async e => {
      e.preventDefault()
      setError(null)
      try {
        await score.mutateAsync({ taskId: submission.task_id, submissionId: submission.id, data: buildTaskScore(value, feedback) })
        await invalidatePaths(qc, '/regular-tasks', '/candidates', '/searches', '/me/tasks', '/me/profile', '/me/card-preview')
      } catch (cause) { setError(errorMessage(cause)) }
    }}>
      <fieldset disabled={score.isPending} className="grid gap-3">
        <label className="grid max-w-48 gap-1 text-sm">Итоговая оценка<Input type="number" min={0} max={100} step={1} required value={value} onChange={e => setValue(e.target.value)} /></label>
        <label className="grid gap-1 text-sm">Обратная связь кандидату<Textarea maxLength={2000} value={feedback} onChange={e => setFeedback(e.target.value)} /></label>
        <p className="text-sm text-muted-foreground">От 75 баллов задание засчитывается в профиль. При исправлении оценки результат пересчитывается.</p>
        <InlineError>{error}</InlineError>
        {score.isSuccess && <p role="status" className="text-sm">Оценка сохранена.</p>}
        <Button className="justify-self-start" type="submit" disabled={score.isPending}>{score.isPending ? 'Сохранение…' : submission.final_score === null ? 'Сохранить оценку' : 'Исправить оценку'}</Button>
      </fieldset>
    </form>
  </article>
}

function Submissions({ taskId }: { taskId: string }) {
  const query = useListTaskSubmissions(taskId, { query: { refetchInterval: 30_000 } })
  return <QueryView query={query}>{list => !list.length
    ? <EmptyState title="Решений пока нет" description="Назначение заданий выполняется автоматически. Здесь появятся отправленные кандидатами решения." />
    : <div>{list.map(s => <Review key={`${s.id}:${s.final_score}:${s.feedback}`} submission={s} />)}</div>}
  </QueryView>
}

export default function EmployerTask() {
  const { taskId = '' } = useParams()
  const query = useGetCompanyTask(taskId, { query: { enabled: Boolean(taskId), refetchInterval: 30_000 } })
  return <div className="grid max-w-4xl gap-6 *:min-w-0">
    <Link to="/e/tasks">← Все задания</Link>
    <QueryView query={query}>{task => <>
      <PageHeader title={task.title} />
      <p className="text-sm">{task.status === 'active' ? 'Приём решений' : 'Приём завершён'} · до {new Date(task.deadline_at).toLocaleString('ru-RU')} · назначено: {task.assigned_count ?? 0} · решений: {task.submissions_count ?? 0}</p>
      <TaskContent task={task} />
      <section className="grid gap-4"><h2 className="text-xl">Решения кандидатов</h2><Submissions taskId={task.id} /></section>
    </>}</QueryView>
  </div>
}
