import type { RegularTask, TaskSubmission } from '@/api/generated/model'
import { codeLanguageLabel, gradeLabel, specializationLabel, taskKindLabel } from '@/lib/labels'

export function TaskContent({ task, showStarter = true }: { task: RegularTask; showStarter?: boolean }) {
  return <div className="grid min-w-0 gap-4">
    <p className="text-sm text-muted-foreground">{task.company.name} · {taskKindLabel[task.kind]} · {task.time_limit_min} мин.
      {task.language && ` · ${codeLanguageLabel[task.language]}`}</p>
    <p className="text-sm text-muted-foreground">{task.specializations.map(s => specializationLabel[s]).join(', ')} · {task.grades.map(g => gradeLabel[g]).join(', ')}</p>
    <p className="whitespace-pre-wrap break-words">{task.description}</p>
    {showStarter && task.starter_code && <div className="min-w-0"><h3 className="mb-2 font-medium">Исходный фрагмент</h3><pre className="max-h-96 overflow-auto rounded-lg border bg-muted p-4 text-sm">{task.starter_code}</pre></div>}
    <div><h3 className="mb-2 font-medium">Критерии оценки</h3><ul className="grid gap-1 text-sm">{task.rubric.map((r, i) => <li key={i} className="flex justify-between gap-4"><span className="break-words">{r.criterion}</span><span className="shrink-0 num">{Math.round(r.weight * 100)}%</span></li>)}</ul></div>
  </div>
}

export function SubmissionContent({ submission }: { submission: TaskSubmission }) {
  return <div className="grid min-w-0 gap-3">
    {submission.answer_text && <p className="whitespace-pre-wrap break-words">{submission.answer_text}</p>}
    {submission.code && <pre className="max-h-96 overflow-auto rounded-lg border bg-muted p-4 text-sm">{submission.code}</pre>}
    <p className="font-medium">{submission.final_score === null ? 'Решение отправлено. Ожидается оценка работодателя.' : `Оценка работодателя: ${submission.final_score} / 100`}</p>
    {submission.final_score !== null && <p className="text-sm text-muted-foreground">{submission.final_score >= 75 ? 'Задание засчитано в профиль.' : 'Для зачёта задания нужно не менее 75 баллов.'}</p>}
    {submission.feedback && <div><h3 className="mb-1 font-medium">Обратная связь</h3><p className="whitespace-pre-wrap break-words">{submission.feedback}</p></div>}
  </div>
}
