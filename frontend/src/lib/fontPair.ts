import { useCallback, useSyncExternalStore } from 'react'

export type FontPairId = 'wix' | 'geologica' | 'commissioner' | 'serif'

export interface FontPair {
  id: FontPairId
  name: string
  display: string
  text: string
  note: string
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'wix',
    name: 'Wix Madefor',
    display: 'Wix Madefor Display',
    text: 'Wix Madefor Text',
    note: 'Ровный гротеск с отдельными версиями для заголовков и для текста. Мелкий кегль и таблицы читаются легко.',
  },
  {
    id: 'geologica',
    name: 'Геологика',
    display: 'Geologica, острота 28',
    text: 'Geologica, острота 0',
    note: 'Гротеск с осью остроты: в заголовках она 28 из 100, в тексте выключена.',
  },
  {
    id: 'commissioner',
    name: 'Commissioner',
    display: 'Commissioner 620',
    text: 'Commissioner 400',
    note: 'Тёплый гротеск с чуть более широкими пропорциями. Декоративные оси выключены.',
  },
  {
    id: 'serif',
    name: 'Антиква и гротеск',
    display: 'Source Serif 4',
    text: 'Wix Madefor Text',
    note: 'Антиква с оптическими размерами в заголовках, гротеск Wix в остальном тексте.',
  },
]

export const DEFAULT_FONT_PAIR: FontPairId = 'wix'
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
