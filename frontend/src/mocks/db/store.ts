import { ACTIVE_INVITATION_STATUSES } from '@/lib/invitationStatus'
import { buildSeed, DB_VERSION } from './seed'
import type { MockDb } from './types'
import { DB_STORAGE_KEY } from '../constants'

/**
 * Хранилище мок-«сервера». В браузере — localStorage (общий для вкладок: кандидат и работодатель
 * в разных вкладках видят изменения друг друга), в тестах — память.
 */
export { DB_STORAGE_KEY }

let memory: MockDb | null = null
let memoryOnly = false

/** Тесты: хранить только в памяти. */
export function useMemoryStorage(): void {
  memoryOnly = true
  memory = null
}

function storage(): Storage | null {
  if (memoryOnly) return null
  try {
    if (typeof window === 'undefined') return null
    const ls = window.localStorage
    if (!ls || typeof ls.getItem !== 'function' || typeof ls.setItem !== 'function') return null
    return ls
  } catch {
    return null
  }
}

export function loadDb(now: Date = new Date()): MockDb {
  const ls = storage()
  let db: MockDb | null = null
  if (ls) {
    const raw = ls.getItem(DB_STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MockDb
        if (parsed.version === DB_VERSION) db = parsed
      } catch {
        db = null
      }
    }
  } else if (memory) {
    db = memory
  }
  if (!db) {
    db = buildSeed(now)
    saveDb(db)
  }
  if (sweepExpired(db, now)) saveDb(db)
  return db
}

export function saveDb(db: MockDb): void {
  const ls = storage()
  if (ls) {
    try {
      ls.setItem(DB_STORAGE_KEY, JSON.stringify(db))
      return
    } catch {
      // Квота localStorage — продолжаем в памяти
    }
  }
  memory = db
}

export function resetDb(now: Date = new Date()): MockDb {
  const db = buildSeed(now)
  memory = null
  saveDb(db)
  return db
}

/** Только для тестов: начать с чистого сида. */
export function resetMemoryDb(): void {
  memory = null
  storage()?.removeItem(DB_STORAGE_KEY)
}

/** Система переводит просроченные активные инвайты в expired и тесты с истёкшим временем — в expired. */
function sweepExpired(db: MockDb, now: Date): boolean {
  let changed = false
  for (const inv of db.invitations) {
    if (ACTIVE_INVITATION_STATUSES.includes(inv.status) && new Date(inv.expiresAt).getTime() <= now.getTime()) {
      inv.status = 'expired'
      inv.events.push({ id: crypto.randomUUID(), at: inv.expiresAt, status: 'expired', actor: 'system', note: 'Срок ответа истёк' })
      changed = true
    }
  }
  for (const test of db.tests) {
    // Небольшой запас на отправку последнего ответа
    if (test.status === 'in_progress' && new Date(test.deadlineAt).getTime() + 60_000 <= now.getTime()) {
      test.status = 'expired'
      test.finishedAt = test.deadlineAt
      changed = true
    }
  }
  return changed
}
