import { cn } from '@/lib/utils'
import fspLogoDark from '@/assets/brand/fsp-logo-dark.svg'
import fspLogoLight from '@/assets/brand/fsp-logo-light.svg'

/** Логотип: «Скаут» + официальный логотип ФСП из брендбука (без перерисовки). */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="font-heading text-[1.05rem] font-semibold tracking-tight text-foreground">Скаут</span>
      {!compact && (
        <>
          <span aria-hidden className="font-heading text-sm text-muted-foreground">
            ×
          </span>
          <img src={fspLogoLight} alt="ФСП" className="h-6 w-auto dark:hidden" width={71} height={24} />
          <img src={fspLogoDark} alt="ФСП" className="hidden h-6 w-auto dark:block" width={71} height={24} />
        </>
      )}
    </span>
  )
}

/**
 * Линии-связи из айдентики ФСП: тонкие линии со скруглёнными углами и узлами на концах.
 * Сдержанный фоновый мотив для экранов категорий и подборки.
 */
export function ConnectLines({ className, variant = 'a' }: { className?: string; variant?: 'a' | 'b' }) {
  const paths =
    variant === 'a'
      ? ['M 8 40 H 140 a 24 24 0 0 1 24 24 V 150 a 24 24 0 0 0 24 24 H 392', 'M 300 8 V 70 a 20 20 0 0 0 20 20 H 470', 'M 60 220 H 210 a 18 18 0 0 0 18 -18 V 120']
      : ['M 10 30 H 230 a 26 26 0 0 1 26 26 V 110 a 26 26 0 0 0 26 26 H 470', 'M 120 220 V 170 a 20 20 0 0 1 20 -20 H 300']
  const dots =
    variant === 'a'
      ? [[8, 40], [392, 174], [300, 8], [470, 90], [60, 220], [228, 120]]
      : [[10, 30], [470, 136], [120, 220], [300, 150]]
  return (
    <svg
      aria-hidden
      viewBox="0 0 480 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn('pointer-events-none absolute inset-0 h-full w-full text-line-motif opacity-[0.16] dark:opacity-[0.22]', className)}
      fill="none"
    >
      {paths.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" />
      ))}
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} fill="currentColor" />
      ))}
    </svg>
  )
}
