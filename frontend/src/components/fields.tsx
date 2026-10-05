import { useId, useMemo, useState, type ReactNode } from 'react'
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react'
import { useTaxonomy } from '@/api/hooks'
import type { Specialization } from '@/api/generated/model'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InlineError } from '@/components/states'
import { formatNumber, parseMoneyInput } from '@/lib/format'
import { cn } from '@/lib/utils'

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: string | null
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="text-muted-foreground">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <InlineError id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</InlineError>
    </div>
  )
}

/** Ввод суммы в рублях: принимает «250 000», «250к», «250 тыс». */
export function MoneyInput({
  id,
  value,
  onChange,
  invalid,
  placeholder,
  ariaLabel,
}: {
  id?: string
  value: number | null
  onChange: (value: number | null) => void
  invalid?: boolean
  placeholder?: string
  ariaLabel?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? (value === null || Number.isNaN(value) ? '' : formatNumber(value))
  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && id ? `${id}-error` : undefined}
        placeholder={placeholder}
        className="num pr-7"
        value={shown}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(parseMoneyInput(e.target.value))
        }}
        onBlur={() => setDraft(null)}
      />
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        ₽
      </span>
    </div>
  )
}

export interface SalaryDraft {
  from: number | null
  to: number | null
}

/** Вилка от–до ₽ (обязательна везде, где она есть по ТЗ). */
export function SalaryRangeField({
  label = 'Вилка, ₽ в месяц на руки',
  value,
  onChange,
  error,
  hint,
  required = true,
  idPrefix,
}: {
  label?: ReactNode
  value: SalaryDraft
  onChange: (value: SalaryDraft) => void
  error?: { field: 'from' | 'to'; message: string } | null
  hint?: ReactNode
  required?: boolean
  idPrefix?: string
}) {
  const auto = useId()
  const base = idPrefix ?? auto
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="text-muted-foreground">
            *
          </span>
        )}
      </legend>
      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2">
        <span className="text-sm text-muted-foreground">от</span>
        <MoneyInput id={`${base}-from`} ariaLabel="Вилка от" value={value.from} onChange={(from) => onChange({ ...value, from })} invalid={error?.field === 'from'} placeholder="250 000" />
        <span className="text-sm text-muted-foreground">до</span>
        <MoneyInput id={`${base}-to`} ariaLabel="Вилка до" value={value.to} onChange={(to) => onChange({ ...value, to })} invalid={error?.field === 'to'} placeholder="320 000" />
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <InlineError id={error ? `${base}-${error.field}-error` : undefined}>{error?.message}</InlineError>
    </fieldset>
  )
}

/** Множественный выбор чипами (формат работы, отрасли, грейды). */
export function ChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  min = 0,
}: {
  options: readonly { value: T; label: string }[]
  value: readonly T[]
  onChange: (value: T[]) => void
  ariaLabel: string
  min?: number
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (active && value.length <= min) return
              onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])
            }}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-md border px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-accent',
            )}
          >
            {active && <IconCheck aria-hidden className="size-3.5" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function SelectField<T extends string>({
  id,
  value,
  onChange,
  options,
  placeholder = 'Выберите',
  invalid,
  ariaLabel,
}: {
  id?: string
  value: T | null
  onChange: (value: T) => void
  options: readonly { value: T; label: string }[]
  placeholder?: string
  invalid?: boolean
  ariaLabel?: string
}) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger id={id} aria-label={ariaLabel} aria-invalid={invalid || undefined} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Выбор навыков из справочника с поиском по синонимам («k8s» → Kubernetes). */
export function SkillPicker({
  value,
  onChange,
  specialization,
  placeholder = 'Добавить навык',
  max = 15,
  exclude = [],
  onChipClick,
  chipHint,
  ariaLabel,
}: {
  value: string[]
  onChange: (value: string[]) => void
  specialization?: Specialization | null
  placeholder?: string
  max?: number
  exclude?: string[]
  onChipClick?: (id: string) => void
  chipHint?: string
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const taxonomy = useTaxonomy()
  const skills = useMemo(() => taxonomy.data?.skills ?? [], [taxonomy.data])
  const byId = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills])
  const sorted = useMemo(
    () =>
      [...skills].sort((a, b) => {
        if (specialization) {
          const am = a.specializations.includes(specialization) ? 0 : 1
          const bm = b.specializations.includes(specialization) ? 0 : 1
          if (am !== bm) return am - bm
        }
        return a.name.localeCompare(b.name, 'ru')
      }),
    [skills, specialization],
  )
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={ariaLabel}>
      {value.map((id) => (
        <span key={id} className="inline-flex h-8 items-center rounded-md border border-primary/30 bg-primary/8 text-sm">
          {onChipClick ? (
            <button type="button" title={chipHint} onClick={() => onChipClick(id)} className="h-full rounded-l-md px-2.5 hover:bg-primary/10">
              {byId.get(id)?.name ?? id}
            </button>
          ) : (
            <span className="px-2.5">{byId.get(id)?.name ?? id}</span>
          )}
          <button
            type="button"
            aria-label={`Убрать ${byId.get(id)?.name ?? id}`}
            onClick={() => onChange(value.filter((v) => v !== id))}
            className="grid h-full w-7 place-items-center rounded-r-md text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          >
            <IconX className="size-3.5" />
          </button>
        </span>
      ))}
      {value.length < max && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-8">
              <IconPlus data-icon="inline-start" />
              {placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Go, постгрес, k8s…" />
              <CommandList>
                <CommandEmpty>Навык не найден</CommandEmpty>
                <CommandGroup>
                  {sorted
                    .filter((s) => !value.includes(s.id) && !exclude.includes(s.id))
                    .map((s) => (
                      <CommandItem
                        key={s.id}
                        value={s.id}
                        keywords={[s.name, ...s.aliases]}
                        onSelect={() => {
                          onChange([...value, s.id])
                          setOpen(false)
                        }}
                      >
                        {s.name}
                        {s.aliases.length > 0 && <span className="ml-auto truncate pl-2 text-xs text-muted-foreground">{s.aliases.slice(0, 2).join(', ')}</span>}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
