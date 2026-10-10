import { act, render, screen } from '@testing-library/react'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { expect, it } from 'vitest'
import { CodeEditor } from './CodeEditor'

it('retains an edited solution when submission locks and unlocks the editor', () => {
  const props = { initial: '// starter', language: 'javascript' as const, ariaLabel: 'Solution' }
  const component = render(<CodeEditor {...props} />)
  const element = screen.getByRole('textbox', { name: 'Solution' })
  const view = EditorView.findFromDOM(element)!
  act(() => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: 'return 42' } }))
  component.rerender(<CodeEditor {...props} readOnly />)
  expect(EditorView.findFromDOM(element)).toBe(view)
  expect(view.state.facet(EditorState.readOnly)).toBe(true)
  expect(view.state.doc.toString()).toBe('return 42')
  component.rerender(<CodeEditor {...props} readOnly={false} />)
  expect(view.state.facet(EditorState.readOnly)).toBe(false)
  expect(view.state.doc.toString()).toBe('return 42')
})
