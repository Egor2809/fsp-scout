import { Suspense, useState, type ComponentType, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import {
  IconBriefcase,
  IconBuilding,
  IconChartDots3,
  IconChecklist,
  IconDatabaseSearch,
  IconHistory,
  IconHome,
  IconLock,
  IconLogout,
  IconMail,
  IconMedal,
  IconMenu2,
  IconMoon,
  IconRefresh,
  IconSend,
  IconSettings,
  IconSparkles,
  IconSun,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react'
import { useListMyInvitations } from '@/api/generated/endpoints/invitations/invitations'
import { useAuth } from '@/auth/context'
import { ConnectLines, Logo } from '@/components/brand'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { config } from '@/config'
import { ACTIVE_INVITATION_STATUSES } from '@/lib/invitationStatus'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
  badge?: number
}

function useNav(role: 'candidate' | 'employer'): { title: string; items: NavItem[] }[] {
  const invitations = useListMyInvitations(undefined, { query: { enabled: role === 'candidate', refetchInterval: 30_000 } })
  const activeCount = invitations.data?.filter((i) => ACTIVE_INVITATION_STATUSES.includes(i.status)).length ?? 0
  if (role === 'candidate') {
    return [
      {
        title: 'Кабинет',
        items: [
          { to: '/c', label: 'Главная', icon: IconHome, end: true },
          { to: '/c/invitations', label: 'Инвайты', icon: IconMail, badge: activeCount },
          { to: '/c/vacancies', label: 'Вакансии', icon: IconBriefcase },
          { to: '/c/applications', label: 'Отклики', icon: IconSend },
          { to: '/c/tasks', label: 'Задания', icon: IconChecklist },
        ],
      },
      {
        title: 'Профиль',
        items: [
          { to: '/c/profile', label: 'Профиль и резюме', icon: IconUser },
          { to: '/c/fsp', label: 'ФСП', icon: IconMedal },
          { to: '/c/privacy', label: 'Приватность', icon: IconLock },
          { to: '/c/history', label: 'Тесты и грейды', icon: IconHistory },
          { to: '/c/settings', label: 'Согласия и аккаунт', icon: IconSettings },
        ],
      },
      { title: 'О платформе', items: [{ to: '/how-it-works', label: 'Как работает тест', icon: IconChartDots3 }] },
    ]
  }
  return [
    {
      title: 'Подбор',
      items: [
        { to: '/e', label: 'Главная', icon: IconHome, end: true },
        { to: '/e/needs/new', label: 'Новая потребность', icon: IconSparkles },
        { to: '/e/searches', label: 'Подборки', icon: IconUsersGroup },
        { to: '/e/candidates', label: 'Банк кандидатов', icon: IconDatabaseSearch },
        { to: '/e/invitations', label: 'Инвайты', icon: IconMail },
      ],
    },
    {
      title: 'Компания',
      items: [
        { to: '/e/vacancies', label: 'Вакансии и отклики', icon: IconBriefcase },
        { to: '/e/tasks', label: 'Регулярные задания', icon: IconChecklist },
        { to: '/e/company', label: 'Профиль компании', icon: IconBuilding },
      ],
    },
    { title: 'О платформе', items: [{ to: '/how-it-works', label: 'Как работает тест', icon: IconChartDots3 }] },
  ]
}

function NavList({ groups, onNavigate }: { groups: { title: string; items: NavItem[] }[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Основная навигация" className="grid gap-5">
      {groups.map((g) => (
        <div key={g.title} className="grid gap-0.5">
          <p className="eyebrow px-2.5 pb-1">{g.title}</p>
          {g.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm no-underline outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive ? 'bg-accent font-medium text-link' : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                )
              }
            >
              <item.icon className="size-4.5 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.7rem] font-semibold text-primary-foreground">{item.badge}</span>
              ) : null}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function ThemeToggle() {
  const { isDark, setPreference } = useTheme()
  return (
    <Button variant="ghost" size="icon" aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'} onClick={() => setPreference(isDark ? 'light' : 'dark')}>
      {isDark ? <IconSun /> : <IconMoon />}
    </Button>
  )
}

async function resetDemoData() {
  const { resetDb } = await import('@/mocks/db/store')
  resetDb()
  window.location.assign('/')
}

export function UserMenu() {
  const { session, provider } = useAuth()
  const navigate = useNavigate()
  if (!session) return null
  const initials = session.displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label="Меню пользователя">
          <span className="grid size-7 place-items-center rounded-full bg-foreground font-mono text-xs font-semibold text-background">{initials}</span>
          <span className="hidden max-w-36 truncate text-sm md:inline">{session.displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="grid">
          <span className="truncate">{session.displayName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{session.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {config.apiMock && (
          <DropdownMenuItem onSelect={() => void resetDemoData()}>
            <IconRefresh />
            Сбросить демо-данные
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={() => {
            void provider.logout().then(() => navigate('/'))
          }}
        >
          <IconLogout />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PageFallback() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Загрузка страницы">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function AppShell({ role }: { role: 'candidate' | 'employer' }) {
  const groups = useNav(role)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  return (
    <div className="min-h-svh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        К содержимому
      </a>
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Открыть меню">
                <IconMenu2 />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-4">
              <SheetHeader className="p-0 pb-4">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <NavList groups={groups} onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to={role === 'candidate' ? '/c' : '/e'} className="no-underline" aria-label="Скаут — на главную кабинета">
            <Logo />
          </Link>
          <span className="ml-2 hidden rounded-md border px-2 py-0.5 font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase sm:inline">
            {role === 'candidate' ? 'Кандидат' : 'Работодатель'}
          </span>
          {config.apiMock && (
            <span className="hidden rounded-md bg-muted px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground md:inline" title="Данные из моков MSW по контракту API">
              демо-данные
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 sm:px-6">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-6 lg:block">
          <NavList groups={groups} />
        </aside>
        <main id="main" className="min-w-0 flex-1 py-6 pb-16">
          <Suspense key={location.pathname} fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  motif = false,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  motif?: boolean
  children?: ReactNode
}) {
  return (
    <header className={cn('relative mb-6', motif && 'overflow-hidden rounded-xl border bg-surface/50 p-5 sm:p-6')}>
      {motif && <ConnectLines />}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground text-pretty">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="relative mt-4">{children}</div>}
    </header>
  )
}

