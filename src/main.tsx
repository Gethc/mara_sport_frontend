import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/contexts/NotificationContext"
import App from './App.tsx'
import './index.css'

// Add error boundary for debugging
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the notification context.</div>;
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <App />
        <Toaster />
      </NotificationProvider>
    </ErrorBoundary>
  </StrictMode>,
)
