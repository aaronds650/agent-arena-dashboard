import { useMemo } from 'react';
import type { DecisionLogEntry } from '@shared/schema';
import { getStrategyMeta } from '@shared/schema';
import { formatTimeWithSeconds } from '@/lib/formatTime';

interface TradeRationaleProps {
  entries: DecisionLogEntry[];
}

function getStrategyColorClasses(strategyId: string): string {
  if (strategyId.startsWith('Grok')) {
    if (strategyId === 'Grok_Ichimoku') return 'bg-gray-900/20 border-gray-900';
    if (strategyId === 'Grok_Pattern') return 'bg-orange-500/20 border-orange-500';
    return 'bg-red-700/20 border-red-700';
  }
  if (strategyId.startsWith('OpenAI')) {
    if (strategyId === 'OpenAI_Pattern') return 'bg-violet-500/20 border-violet-500';
    return 'bg-green-700/20 border-green-700';
  }
  if (strategyId.startsWith('Gemini')) {
    if (strategyId === 'Gemini_Pattern') return 'bg-cyan-500/20 border-cyan-500';
    return 'bg-blue-700/20 border-blue-700';
  }
  return 'bg-gray-100/20 border-gray-300';
}

// Parse timestamp to comparable number (handles ISO strings and unix timestamps)
function parseTimestamp(ts: string | number): number {
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'string') {
    // Try ISO date first
    if (ts.includes('T') || ts.includes('-')) {
      const parsed = new Date(ts).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Try parsing as number string
    const num = parseFloat(ts);
    if (!isNaN(num)) return num;
  }
  return 0;
}

export function TradeRationale({ entries }: TradeRationaleProps) {
  // Memoize sorted entries to prevent unnecessary re-renders
  // Static list sorted by timestamp - most recent first, NO animations
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp);
      const timeB = parseTimestamp(b.timestamp);
      return timeB - timeA;
    });
  }, [entries]);

  if (sortedEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500" data-testid="trade-rationale-empty">
        <div className="text-center">
          <p className="text-sm font-medium">No Recent Decisions</p>
          <p className="text-xs text-gray-400 mt-1">Agent reasoning and signals will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-auto [-webkit-overflow-scrolling:touch]" data-testid="trade-rationale-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {sortedEntries.map((entry) => {
          const meta = getStrategyMeta(entry.strategyId);
          const colorClasses = getStrategyColorClasses(entry.strategyId);
          
          return (
            <div 
              key={entry.id}
              className={`${colorClasses} border-2 rounded-lg p-4 backdrop-blur-sm`}
              data-testid={`card-rationale-${entry.id}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${meta.borderClass.replace('border-', 'bg-')}`} />
                  <span className="text-sm font-semibold text-gray-900">
                    {meta.name} ({meta.strategy})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground" data-testid="text-rationale-timestamp">
                  {formatTimeWithSeconds(entry.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed" data-testid="text-rationale-content">
                {entry.rationale}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
