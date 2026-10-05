import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router'
import { homeFor, useAuth } from '@/auth/context'
import { AppShell, PageFallback } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/motion'

const Landing = lazy(() => import('@/pages/common/Landing'))
const HowItWorks = lazy(() => import('@/pages/common/HowItWorks'))
const NotFound = lazy(() => import('@/pages/common/NotFound'))
const Fonts = lazy(() => import('@/pages/common/Fonts'))

const CHome = lazy(() => import('@/pages/candidate/Home'))
const COnboarding = lazy(() => import('@/pages/candidate/Onboarding'))
const CTest = lazy(() => import('@/pages/candidate/TestRun'))
const CResult = lazy(() => import('@/pages/candidate/TestResult'))
const CInvitations = lazy(() => import('@/pages/candidate/Invitations'))
const CProfile = lazy(() => import('@/pages/candidate/Profile'))
const CPrivacy = lazy(() => import('@/pages/candidate/Privacy'))
const CFsp = lazy(() => import('@/pages/candidate/Fsp'))
const CHistory = lazy(() => import('@/pages/candidate/History'))
const CSettings = lazy(() => import('@/pages/candidate/Settings'))
const CVacancies = lazy(() => import('@/pages/candidate/Vacancies'))
const CApplications = lazy(() => import('@/pages/candidate/Applications'))

const EHome = lazy(() => import('@/pages/employer/Home'))
const ENeedNew = lazy(() => import('@/pages/employer/NeedNew'))
const ENeed = lazy(() => import('@/pages/employer/Need'))
const ESearches = lazy(() => import('@/pages/employer/Searches'))
const ESearch = lazy(() => import('@/pages/employer/Search'))
const ECandidates = lazy(() => import('@/pages/employer/Candidates'))
const ECandidate = lazy(() => import('@/pages/employer/Candidate'))
const EInvitations = lazy(() => import('@/pages/employer/Invitations'))
const EVacancies = lazy(() => import('@/pages/employer/Vacancies'))
const ECompany = lazy(() => import('@/pages/employer/Company'))
const Soon = lazy(() => import('@/pages/common/Soon'))

function RequireRole({ role, children }: { role: 'candidate' | 'employer'; children: ReactNode }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/" replace />
  if (session.role !== role) return <Navigate to={homeFor(session)} replace />
  return <>{children}</>
}

function SharedShell() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/" replace />
  return <AppShell role={session.role === 'employer' ? 'employer' : 'candidate'} />
}

function Bare() {
  const { pathname } = useLocation()
  return (
    <Suspense key={pathname} fallback={<div className="p-6"><PageFallback /></div>}>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <Bare />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/fonts', element: <Fonts /> },
    ],
  },
  {
    path: '/c',
    element: (
      <RequireRole role="candidate">
        <AppShell role="candidate" />
      </RequireRole>
    ),
    children: [
      { index: true, element: <CHome /> },
      { path: 'onboarding', element: <COnboarding /> },
      { path: 'test/:testId', element: <CTest /> },
      { path: 'results/:testId', element: <CResult /> },
      { path: 'invitations', element: <CInvitations /> },
      { path: 'profile', element: <CProfile /> },
      { path: 'privacy', element: <CPrivacy /> },
      { path: 'fsp', element: <CFsp /> },
      { path: 'history', element: <CHistory /> },
      { path: 'settings', element: <CSettings /> },
      { path: 'vacancies', element: <CVacancies /> },
      { path: 'applications', element: <CApplications /> },
      { path: 'tasks', element: <Soon /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/e',
    element: (
      <RequireRole role="employer">
        <AppShell role="employer" />
      </RequireRole>
    ),
    children: [
      { index: true, element: <EHome /> },
      { path: 'needs/new', element: <ENeedNew /> },
      { path: 'needs/:needId', element: <ENeed /> },
      { path: 'searches', element: <ESearches /> },
      { path: 'searches/:searchId', element: <ESearch /> },
      { path: 'candidates', element: <ECandidates /> },
      { path: 'candidates/:candidateId', element: <ECandidate /> },
      { path: 'invitations', element: <EInvitations /> },
      { path: 'vacancies', element: <EVacancies /> },
      { path: 'company', element: <ECompany /> },
      { path: 'tasks', element: <Soon /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: <SharedShell />,
    children: [
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
