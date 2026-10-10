import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import './index.css'
import App from './App.tsx'
import { createQueryClient } from '@/api/queryClient'
import { createAuthProvider } from '@/auth'
import { AuthGate } from '@/auth/AuthGate'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { applyFontPair } from '@/lib/fontPair'
import { applyTheme } from '@/lib/theme'

async function bootstrap() {
  applyTheme()
  applyFontPair()
  // Keep the condition compile-time constant so production builds discard mock answer banks.
  if (import.meta.env.VITE_API_MOCK !== 'false') {
    const { startMockWorker } = await import('@/mocks/browser')
    await startMockWorker()
  }
  const provider = createAuthProvider()
  const { session, returnTo } = await provider.init()
  if (returnTo) window.history.replaceState(null, '', returnTo)
  const queryClient = createQueryClient()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthGate provider={provider} initial={session}>
          <MotionConfig reducedMotion="user">
            <TooltipProvider>
              <App />
              <Toaster position="top-center" />
            </TooltipProvider>
          </MotionConfig>
        </AuthGate>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
