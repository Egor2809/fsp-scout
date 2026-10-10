import { useEffect, useRef } from 'react'
import { basicSetup, EditorView } from 'codemirror'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { go } from '@codemirror/lang-go'
import { javascript } from '@codemirror/lang-javascript'
import { sql } from '@codemirror/lang-sql'
import type { CodeLanguage } from '@/api/generated/model'

function lang(language: CodeLanguage | null | undefined): Extension[] {
  switch (language) {
    case 'python':
      return [python()]
    case 'go':
      return [go()]
    case 'javascript':
      return [javascript()]
    case 'typescript':
      return [javascript({ typescript: true })]
    case 'sql':
      return [sql()]
    default:
      return []
  }
}

const theme = EditorView.theme({
  '&': { fontSize: '13px', backgroundColor: 'var(--background)', color: 'var(--foreground)' },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--foreground)' },
  '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--muted-foreground)', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'color-mix(in oklab, var(--primary) 6%, transparent)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { minHeight: '240px' },
})

/** CodeMirror 6: неконтролируемый редактор, наружу отдаёт текст через onChange. */
export function CodeEditor({
  initial,
  language,
  onChange,
  onPaste,
  readOnly = false,
  ariaLabel,
}: {
  initial: string
  language?: CodeLanguage | null
  onChange?: (value: string) => void
  onPaste?: () => void
  readOnly?: boolean
  ariaLabel: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const editor = useRef<EditorView | null>(null)
  const editable = useRef(new Compartment())
  const cb = useRef({ onChange, onPaste })
  useEffect(() => {
    cb.current = { onChange, onPaste }
  })
  useEffect(() => {
    if (!host.current) return
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial,
        extensions: [
          basicSetup,
          theme,
          ...lang(language),
          editable.current.of(EditorState.readOnly.of(false)),
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange?.(u.state.doc.toString())
          }),
          EditorView.domEventHandlers({
            paste: () => {
              cb.current.onPaste?.()
              return false
            },
          }),
        ],
      }),
    })
    editor.current = view
    return () => { editor.current = null; view.destroy() }
  }, [initial, language, ariaLabel])
  useEffect(() => {
    editor.current?.dispatch({ effects: editable.current.reconfigure(EditorState.readOnly.of(readOnly)) })
  }, [readOnly, initial, language, ariaLabel])
  return <div ref={host} className="overflow-hidden rounded-lg border" />
}
