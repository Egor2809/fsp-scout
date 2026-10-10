import { useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { IconAlertOctagon, IconInbox, IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage } from '@/api/problem'
import { ConnectLines } from '@/components/brand'
import { cn } from '@/lib/utils'

/** Ошибка: тёмно-красный с иконкой (не фирменный красный ФСП). */
export function InlineError({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className={cn('flex items-start gap-1.5 text-sm text-destructive', className)}>
      <IconAlertOctagon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

export function ErrorBanner({ title = 'Не получилось', error, onRetry, className }: { title?: string; error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive-surface p-4 sm:flex-row sm:items-center', className)}>
      <IconAlertOctagon aria-hidden className="size-5 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-destructive">{title}</p>
        <p className="text-sm text-foreground/80">{errorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <IconRefresh data-icon="inline-start" />
          Повторить
        </Button>
      )}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <Empty className={cn('relative overflow-hidden rounded-lg border border-dashed bg-surface/40', className)}>
      <ConnectLines className="opacity-[0.1] dark:opacity-[0.14]" />
      <EmptyHeader className="relative">
        <EmptyMedia variant="icon">{icon ?? <IconInbox />}</EmptyMedia>
        <EmptyTitle className="font-heading font-semibold">{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent className="relative">{action}</EmptyContent>}
    </Empty>
  )
}

export function SkeletonCards({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-3', className)} aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="mb-3 h-4 w-1/3" />
          <Skeleton className="mb-2 h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

/** Единая обработка состояний запроса: скелетон → ошибка с повтором → данные. */
export function QueryView<T>({
  query,
  skeleton,
  children,
  errorTitle,
}: {
  query: Pick<UseQueryResult<T>, 'data' | 'isPending' | 'isError' | 'error' | 'refetch'>
  skeleton?: ReactNode
  children: (data: T) => ReactNode
  errorTitle?: string
}) {
  // Если данные пришли после скелетона, проявляем их; из кэша показываем сразу
  const [afterSkeleton] = useState(() => query.isPending)
  const reduce = useReducedMotion()
  if (query.isPending) return <>{skeleton ?? <SkeletonCards />}</>
  if (query.isError || query.data === undefined) {
    return <ErrorBanner title={errorTitle ?? 'Не удалось загрузить данные'} error={query.error} onRetry={() => void query.refetch()} />
  }
  return (
    <motion.div initial={afterSkeleton && !reduce ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      {children(query.data)}
    </motion.div>
  )
}
