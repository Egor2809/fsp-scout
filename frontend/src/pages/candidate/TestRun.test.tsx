import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import type { TestItem } from '@/api/generated/model'
import { ItemView } from './TestRun'

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))
vi.mock('@/api/generated/endpoints/assessment/assessment', () => ({
  useSubmitTestAnswer: () => ({ mutate, isPending: false, error: null }),
  useRunTestCode: () => ({ isPending: false, error: null }),
}))
vi.mock('@/components/CodeEditor', () => ({ CodeEditor: () => null }))

const item: TestItem = { instance_id: 'instance-one', index: 1, block: 'adaptive', type: 'single_choice', title: 'Вопрос', prompt: 'Выберите ответ',
  competency: { id: 'systems', name: 'Системы' }, difficulty_level: 2, code: null, answer_language: null, starter_code: null, max_length: null, public_tests: null,
  options: [{ id: 'o1', text: 'Первый вариант' }, { id: 'o2', text: 'Второй вариант' }, { id: 'o3', text: 'Третий вариант' }] }
beforeEach(() => mutate.mockClear())

it('sends the selected single option to the generated API hook and resets for a new instance', () => {
  const view = render(<ItemView key={item.instance_id} testId="test" item={item} onAnswered={() => {}} />)
  expect(screen.getByRole('button', { name: 'Ответить', exact: true })).toBeDisabled()
  fireEvent.click(screen.getByRole('radio', { name: 'Второй вариант' }))
  fireEvent.click(screen.getByRole('button', { name: 'Ответить', exact: true }))
  expect(mutate.mock.calls[0][0]).toMatchObject({ testId: 'test', data: { instance_id: 'instance-one', answer: { option_ids: ['o2'] } } })
  expect(mutate.mock.calls[0][0].data.answer).toEqual({ option_ids: ['o2'] })
  view.rerender(<ItemView key="instance-two" testId="test" item={{ ...item, instance_id: 'instance-two' }} onAnswered={() => {}} />)
  expect(screen.getByRole('button', { name: 'Ответить', exact: true })).toBeDisabled()
})

it('sends the complete multiple selection, supports unchecking, and skips without option_ids', () => {
  render(<ItemView testId="test" item={{ ...item, type: 'multiple_choice' }} onAnswered={() => {}} />)
  fireEvent.click(screen.getByRole('checkbox', { name: 'Первый вариант' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Второй вариант' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Третий вариант' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Второй вариант' }))
  fireEvent.click(screen.getByRole('button', { name: 'Ответить', exact: true }))
  expect(mutate.mock.calls[0][0].data.answer).toEqual({ option_ids: ['o1', 'o3'] })
  fireEvent.click(screen.getByRole('button', { name: 'Не знаю, дальше' }))
  expect(mutate.mock.calls[1][0].data.answer).toEqual({ skipped: true })
})
