import type { CodeLanguage, Grade, RegularTaskInput, Specialization, TaskKind, TaskScore, TaskSubmissionCreate } from '../api/generated/model/index.ts'

export interface TaskDraft {
  title: string
  description: string
  kind: TaskKind
  specializations: Specialization[]
  grades: Grade[]
  minutes: string
  language: CodeLanguage
  starter: string
  deadline: string
  rubric: { criterion: string; percent: string }[]
}

export function buildTaskInput(draft: TaskDraft, now = new Date()): RegularTaskInput {
  const title = draft.title.trim(), description = draft.description.trim()
  if (title.length < 5 || title.length > 120) throw new Error('Название должно содержать от 5 до 120 символов.')
  if (description.length < 30 || description.length > 4000) throw new Error('Опишите задание: от 30 до 4000 символов.')
  if (!draft.specializations.length || !draft.grades.length) throw new Error('Выберите хотя бы одну специализацию и один грейд.')
  const minutes = Number(draft.minutes), deadline = new Date(draft.deadline)
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 30) throw new Error('Время выполнения — от 5 до 30 минут.')
  if (!Number.isFinite(deadline.getTime()) || deadline.getTime() <= now.getTime() + minutes * 60000) throw new Error('До срока сдачи должно оставаться больше времени, чем требуется на выполнение.')
  if (draft.rubric.length < 1 || draft.rubric.length > 6) throw new Error('Добавьте от 1 до 6 критериев оценки.')
  const rubric = draft.rubric.map(r => ({ criterion: r.criterion.trim(), weight: Number(r.percent) / 100 }))
  if (rubric.some((r, i) => r.criterion.length < 3 || r.criterion.length > 200 || !draft.rubric[i].percent.trim() || !Number.isFinite(r.weight) || r.weight < 0 || r.weight > 1)) throw new Error('У каждого критерия нужны название (3–200 символов) и вес от 0 до 100%.')
  if (new Set(rubric.map(r => r.criterion.toLocaleLowerCase('ru'))).size !== rubric.length) throw new Error('Названия критериев не должны повторяться.')
  if (Math.abs(rubric.reduce((sum, r) => sum + r.weight, 0) - 1) >= 1e-6) throw new Error('Сумма весов критериев должна быть 100%.')
  if (draft.kind === 'code' && draft.language === 'text') throw new Error('Выберите язык программирования.')
  if (draft.starter.length > 10000) throw new Error('Исходный фрагмент должен содержать не более 10 000 символов.')
  return { title, description, kind: draft.kind, specializations: [...new Set(draft.specializations)], grades: [...new Set(draft.grades)],
    time_limit_min: minutes, language: draft.kind === 'approach' ? null : draft.language,
    starter_code: draft.kind === 'approach' ? null : draft.starter.trim() || null, rubric, deadline_at: deadline.toISOString() }
}

export function buildTaskSubmission(kind: TaskKind, language: CodeLanguage | null, text: string, code: string): TaskSubmissionCreate {
  const answer = text.trim(), source = code.trim()
  if (kind === 'code' && !source) throw new Error('Добавьте код решения.')
  if (kind !== 'code' && !answer) throw new Error('Добавьте текст решения.')
  if (answer.length > 4000 || source.length > 20000) throw new Error('Допустимо до 4 000 символов пояснения и 20 000 символов кода.')
  return { answer_text: answer || null, code: kind === 'code' ? source : null, language: kind === 'code' ? language : null }
}

export function buildTaskScore(value: string, feedback: string): TaskScore {
  const score = Number(value)
  if (!value.trim() || !Number.isInteger(score) || score < 0 || score > 100) throw new Error('Укажите целую оценку от 0 до 100.')
  const comment = feedback.trim()
  if (comment.length > 2000) throw new Error('Обратная связь должна содержать не более 2 000 символов.')
  return { final_score: score, feedback: comment || null }
}
