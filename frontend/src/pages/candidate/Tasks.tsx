import { Link } from 'react-router'
import { useListMyTasks } from '@/api/generated/endpoints/tasks/tasks'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, QueryView } from '@/components/states'
import { taskAssignmentStatusLabel, taskKindLabel } from '@/lib/labels'

export default function CandidateTasks() {
  const query = useListMyTasks({ query: { refetchInterval: 30_000 } })
  return <>
    <PageHeader title="Регулярные задания" />
    <p className="mb-6 max-w-2xl text-muted-foreground">Задания подбираются по подтверждённой категории не чаще одного раза в две недели. Решения с оценкой от 75 баллов засчитываются в профиль.</p>
    <QueryView query={query}>{list => !list.length
      ? <EmptyState title="Заданий пока нет" description="Подходящие задания появятся здесь после назначения. Проверьте, что категория подтверждена и профиль доступен для подбора." />
      : <ul className="grid max-w-3xl gap-4">{list.map(a => <li key={a.task.id}><Link to={`/c/tasks/${a.task.id}`} className="grid gap-2 rounded-lg border bg-card p-5 no-underline hover:border-primary/50">
        <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{a.task.title}</h2><span className="text-sm">{taskAssignmentStatusLabel[a.status]}</span></div>
        <p className="text-sm text-muted-foreground">{a.task.company.name} · {taskKindLabel[a.task.kind]} · {a.task.time_limit_min} мин.</p>
        <p className="text-sm">Срок сдачи: {new Date(a.due_at).toLocaleString('ru-RU')}</p>
        {a.submission?.final_score != null && <p className="num font-medium">Оценка: {a.submission.final_score} / 100</p>}
      </Link></li>)}</ul>}
    </QueryView>
  </>
}
