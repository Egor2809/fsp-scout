import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/** Общая кривая: быстрый старт, мягкая остановка. Все длительности 150–300 мс, кроме счётчика. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Вход страницы: прозрачность и сдвиг на 6px. Выход не анимируем, чтобы навигация не ждала. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE_OUT }}>
      {children}
    </motion.div>
  )
}

const TAGS = { div: motion.div, li: motion.li, article: motion.article, span: motion.span } as const

/**
 * Появление элемента: прозрачность и сдвиг. index даёт ступенчатую задержку (stagger),
 * после восьмого элемента задержка не растёт, чтобы длинный список не «тянулся».
 */
export function FadeIn({
  children,
  index = 0,
  delay = 0,
  y = 6,
  as = 'div',
  className,
}: {
  children: ReactNode
  index?: number
  delay?: number
  y?: number
  as?: keyof typeof TAGS
  className?: string
}) {
  const reduce = useReducedMotion()
  const Tag = TAGS[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE_OUT, delay: delay + Math.min(index, 8) * 0.035 }}
    >
      {children}
    </Tag>
  )
}

/** Число «набегает» от 0. Ширина зафиксирована в ch, поэтому соседние элементы не двигаются. */
export function CountUp({ value, duration = 0.8, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  useLayoutEffect(() => {
    const node = ref.current
    if (!node || reduce) return
    node.textContent = '0'
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => {
        node.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [value, duration, reduce])
  return (
    <span className={className}>
      <span ref={ref} aria-hidden className="inline-block text-right" style={{ minWidth: `${String(value).length}ch` }}>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

/** Смена значения с подменой: старое уходит, новое появляется с лёгким масштабом (статус инвайта). */
export function Swap({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        className={cn('inline-flex', className)}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.18, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  )
}
