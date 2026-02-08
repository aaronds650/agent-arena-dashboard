import type { TradeHistoryEntry } from '@shared/schema';
import { getStrategyMeta } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/formatTime';

function getRowColorClasses(strategyId: string): string {
  if (strategyId.startsWith('Grok')) {
    if (strategyId === 'Grok_Ichimoku') return 'bg-gray-900/20 border-l-4 border-gray-900';
    if (strategyId === 'Grok_Pattern') return 'bg-orange-500/20 border-l-4 border-orange-500';
    return 'bg-red-700/20 border-l-4 border-red-700';
  }
  if (strategyId.startsWith('OpenAI')) {
    if (strategyId === 'OpenAI_Pattern') return 'bg-violet-500/20 border-l-4 border-violet-500';
    return 'bg-green-700/20 border-l-4 border-green-700';
  }
  if (strategyId.startsWith('Gemini')) {
    if (strategyId === 'Gemini_Pattern') return 'bg-cyan-500/20 border-l-4 border-cyan-500';
    return 'bg-blue-700/20 border-l-4 border-blue-700';
  }
  return 'bg-gray-100/20 border-l-4 border-gray-300';
}

interface TradeHistoryProps {
  entries: TradeHistoryEntry[];
}

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  if (value >= 0) {
    return `+${formatted}`;
  }
  return `-${formatted}`;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function TradeHistory({ entries }: TradeHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500" data-testid="trade-history-empty">
        <div className="text-center">
          <p className="text-sm font-medium">No Trade History</p>
          <p className="text-xs text-gray-400 mt-1">Completed trades will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-auto [-webkit-overflow-scrolling:touch]" data-testid="trade-history-container">
      <table className="w-full min-w-[800px]" data-testid="trade-history-table">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Time</th>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Strategy</th>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Asset</th>
            <th className="text-center px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Action</th>
            <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Qty</th>
            <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Price</th>
            <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Realized PnL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => {
            const meta = getStrategyMeta(entry.strategyId);
            const pnlColor = entry.realizedPnl >= 0 ? 'text-green-600' : 'text-red-600';
            const rowClasses = getRowColorClasses(entry.strategyId);
            
            return (
              <tr 
                key={entry.id} 
                className={`${rowClasses} hover:opacity-80 transition-opacity`}
                data-testid={`row-history-${entry.id}`}
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-muted-foreground">{formatTime(entry.timestamp)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{meta.name} ({meta.strategy})</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{entry.asset}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge 
                    variant="secondary" 
                    className={entry.action === 'BUY' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                    }
                    data-testid={`badge-action-${entry.id}`}
                  >
                    {entry.action}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-gray-900">
                    {entry.qty > 0 ? entry.qty.toFixed(3) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-gray-900">{formatPrice(entry.price)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-mono font-medium ${pnlColor}`}>
                    {entry.realizedPnl !== 0 ? formatCurrency(entry.realizedPnl) : '-'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
