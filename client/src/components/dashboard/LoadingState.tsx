import { Activity, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="dashboard-skeleton">
      <header className="h-20 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Activity className="h-6 w-6 text-gray-300" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-36" />
          </div>
          <Skeleton className="h-6 w-48" />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        <div className="flex-[6] bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="h-[calc(100%-3rem)] flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-400">Loading chart data...</p>
            </div>
          </div>
        </div>
        
        <div className="flex-[4] bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 flex gap-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="dashboard-error">
      <header className="h-20 border-b border-gray-200 bg-white px-6 flex items-center">
        <div className="flex items-center gap-4">
          <Activity className="h-6 w-6 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pro-Grade Dashboard</h1>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-sm text-gray-600 mb-4">
            Unable to connect to the trading engine. This may be due to network issues or the backend service being unavailable.
          </p>
          <p className="text-xs text-gray-400 font-mono mb-6 p-2 bg-gray-100 rounded">
            {error.message}
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            data-testid="button-retry"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}
