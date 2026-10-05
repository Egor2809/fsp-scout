import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { createQueryClient } from '@/api/queryClient'
import { createAuthProvider } from '@/auth'
import { AuthGate } from '@/auth/AuthGate'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { config } from '@/config'
import { applyTheme } from '@/lib/theme'

async function bootstrap() {
  applyTheme()
  if (config.apiMock) {
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
          <TooltipProvider>
            <App />
            <Toaster position="top-center" />
          </TooltipProvider>
        </AuthGate>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
