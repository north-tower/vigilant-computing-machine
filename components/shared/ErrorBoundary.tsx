import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center text-amber">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg text-text">Something went wrong</h3>
            <p className="text-sm text-text-muted max-w-xs">We encountered an error loading this section. Please try refreshing the page.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
