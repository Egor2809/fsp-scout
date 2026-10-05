import { useCallback, useSyncExternalStore } from 'react'

export type FontPairId = 'serif' | 'sber' | 'literata' | 'future' | 'jura' | 'wix'

export interface FontPair {
  id: FontPairId
  name: string
  display: string
  text: string
  note: string
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'serif',
    name: 'Source Serif',
    display: 'Source Serif 4, 260, оптический размер display',
    text: 'Wix Madefor Text 400',
    note: 'Тонкая антиква в крупных заголовках, гротеск в тексте. Оптический размер включается сам: чем крупнее кегль, тем контрастнее штрихи.',
  },
  {
    id: 'sber',
    name: 'СберИндекс',
    display: 'Oranienbaum 400',
    text: 'Ysabeau Office 400, цифры Martian Mono',
    note: 'Набор из проекта СберИндекс: контрастная антиква в заголовках, гуманистический гротеск в тексте, широкий моноширинный для цифр.',
  },
  {
    id: 'literata',
    name: 'Literata',
    display: 'Literata, 240, оптический размер display',
    text: 'Wix Madefor Text 400',
    note: 'Антиква с более мягкими засечками и широкой кириллицей. Теплее и «книжнее», чем Source Serif.',
  },
  {
    id: 'future',
    name: 'Геологика, острая',
    display: 'Geologica 200, острота 100',
    text: 'Wix Madefor Text 400',
    note: 'Футуристичный вариант: тонкий гротеск с заострёнными окончаниями в крупных заголовках, спокойный текст.',
  },
  {
    id: 'jura',
    name: 'Jura',
    display: 'Jura 300',
    text: 'Wix Madefor Text 400',
    note: 'Футуристичный вариант: монолинейный шрифт с квадратными овалами. Самое тонкое начертание у Jura 300.',
  },
  {
    id: 'wix',
    name: 'Wix Madefor',
    display: 'Wix Madefor Display 400',
    text: 'Wix Madefor Text 400',
    note: 'Один гротеск с отдельными версиями для заголовков и текста. Самый нейтральный вариант.',
  },
]

export const DEFAULT_FONT_PAIR: FontPairId = 'serif'
const KEY = 'scout.fontPair'
const listeners = new Set<() => void>()

function isPair(v: unknown): v is FontPairId {
  return FONT_PAIRS.some((p) => p.id === v)
}

function read(): FontPairId {
  try {
    const v = localStorage.getItem(KEY)
    return isPair(v) ? v : DEFAULT_FONT_PAIR
  } catch {
    return DEFAULT_FONT_PAIR
  }
}

export function applyFontPair(id: FontPairId = read()): void {
  document.documentElement.dataset.font = id
}

export function useFontPair(): [FontPairId, (id: FontPairId) => void] {
  const pair = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => DEFAULT_FONT_PAIR,
  )
  const setPair = useCallback((next: FontPairId) => {
    try {
      if (next === DEFAULT_FONT_PAIR) localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, next)
    } catch {
      // нет доступа к хранилищу: применяем только к текущей странице
    }
    applyFontPair(next)
    for (const l of listeners) l()
  }, [])
  return [pair, setPair]
}
