import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlinkUIProvider, Toaster } from '@blinkdotnew/ui'
import { I18nProvider } from './lib/i18n.tsx'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlinkUIProvider theme="linear" darkMode="system">
        <I18nProvider>
          <Toaster />
          <App />
        </I18nProvider>
      </BlinkUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
