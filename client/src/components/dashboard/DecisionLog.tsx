import type { DecisionLogEntry } from '@shared/schema';
import { getStrategyMeta } from '@shared/schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimeWithSeconds } from '@/lib/formatTime';

interface DecisionLogProps {
  entries: DecisionLogEntry[];
}

export function DecisionLog({ entries }: DecisionLogProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500" data-testid="decision-log-empty">
        <div className="text-center">
          <p className="text-sm font-medium">No Recent Decisions</p>
          <p className="text-xs text-gray-400 mt-1">Agent decisions and rationales will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="decision-log-container">
      <div className="space-y-3 p-4">
        {entries.map((entry) => {
          const meta = getStrategyMeta(entry.strategyId);
          
          return (
            <div 
              key={entry.id}
              className={`border-l-4 ${meta.borderClass} bg-white rounded-r-lg shadow-sm p-4`}
              data-testid={`card-decision-${entry.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {meta.name} ({meta.strategy})
                </span>
                <span className="text-xs text-muted-foreground" data-testid="text-decision-timestamp">
                  {formatTimeWithSeconds(entry.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed" data-testid="text-decision-rationale">
                {entry.rationale}
              </p>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
