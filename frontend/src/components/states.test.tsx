import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/problem'
import { QueryView } from './states'

function Draft() {
  const [text, setText] = useState('')
  return <textarea aria-label="Draft" value={text} onChange={e => setText(e.target.value)} />
}

describe('QueryView background refresh', () => {
  it('preserves the mounted form and its draft through an outage and recovery', () => {
    const query = { data: { id: 'task' }, isPending: false, isError: false, error: null as Error | null, refetch: vi.fn() }
    const view = render(<QueryView query={query}>{() => <Draft />}</QueryView>)
    const input = screen.getByRole('textbox', { name: 'Draft' })
    fireEvent.change(input, { target: { value: 'Unsent solution' } })
    view.rerender(<QueryView query={{ ...query, isError: true, error: ApiError.network('offline') }}>{() => <Draft />}</QueryView>)
    expect(screen.getByRole('textbox')).toBe(input)
    expect(input).toHaveValue('Unsent solution')
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(query.refetch).toHaveBeenCalledOnce()
    view.rerender(<QueryView query={query}>{() => <Draft />}</QueryView>)
    expect(screen.getByRole('textbox')).toBe(input)
    expect(input).toHaveValue('Unsent solution')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('hides cached content when access is revoked', () => {
    render(<QueryView query={{ data: { id: 'task' }, isPending: false, isError: true, error: ApiError.fromStatus(403), refetch: vi.fn() }}>{() => <Draft />}</QueryView>)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Недостаточно прав')
  })

  it('shows an error instead of rendering children when the initial request fails', () => {
    const children = vi.fn(() => <Draft />)
    render(<QueryView query={{ data: undefined, isPending: false, isError: true, error: ApiError.fromStatus(503), refetch: vi.fn() }}>{children}</QueryView>)
    expect(children).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
