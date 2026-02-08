import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import type { LeaderboardEntry } from '@shared/schema';
import { getStrategyMeta } from '@shared/schema';

function getRowColorClasses(strategyId: string | undefined): string {
  if (!strategyId) return 'bg-gray-100/20 border-l-4 border-gray-300';
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

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

type SortField = 'accountValue' | 'percentReturn' | 'winRate' | 'cash' | 'totalTrades' | 'buys' | 'sells' | 'activeHolds';
type SortDirection = 'asc' | 'desc';

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || value === null) return '+0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>('accountValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Defensive: ensure entries is always an array
  const safeEntries = entries || [];

  const sortedEntries = useMemo(() => {
    const uniqueEntries = safeEntries.filter((entry, index, self) => 
      index === self.findIndex(e => e.strategyId === entry.strategyId)
    );
    return [...uniqueEntries].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'accountValue':
          comparison = a.accountValue - b.accountValue;
          break;
        case 'percentReturn':
          comparison = a.percentReturn - b.percentReturn;
          break;
        case 'winRate':
          comparison = (a.winRate ?? 0) - (b.winRate ?? 0);
          break;
        case 'cash':
          comparison = a.cash - b.cash;
          break;
        case 'totalTrades':
          comparison = a.totalTrades - b.totalTrades;
          break;
        case 'buys':
          comparison = a.buys - b.buys;
          break;
        case 'sells':
          comparison = a.sells - b.sells;
          break;
        case 'activeHolds':
          comparison = a.activeHolds - b.activeHolds;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [safeEntries, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3" /> : 
      <ChevronDown className="h-3 w-3" />;
  };

  if (safeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500" data-testid="leaderboard-empty">
        <div className="text-center">
          <p className="text-sm font-medium">No Leaderboard Data</p>
          <p className="text-xs text-gray-400 mt-1">Strategy rankings will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-auto [-webkit-overflow-scrolling:touch]" data-testid="leaderboard-container">
      <table className="w-full min-w-[900px]" data-testid="leaderboard-table">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              Agent / Strategy
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('cash')}
              data-testid="header-cash"
            >
              <div className="flex items-center justify-end gap-1">
                Cash Balance
                <SortIcon field="cash" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('accountValue')}
              data-testid="header-total-value"
            >
              <div className="flex items-center justify-end gap-1">
                Total Value
                <SortIcon field="accountValue" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('percentReturn')}
              data-testid="header-return"
            >
              <div className="flex items-center justify-end gap-1">
                Return %
                <SortIcon field="percentReturn" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('winRate')}
              data-testid="header-win-rate"
            >
              <div className="flex items-center justify-end gap-1">
                Win Rate
                <SortIcon field="winRate" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('totalTrades')}
              data-testid="header-trades"
            >
              <div className="flex items-center justify-end gap-1">
                Trades
                <SortIcon field="totalTrades" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('buys')}
              data-testid="header-buys"
            >
              <div className="flex items-center justify-end gap-1">
                Buys
                <SortIcon field="buys" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('sells')}
              data-testid="header-sells"
            >
              <div className="flex items-center justify-end gap-1">
                Sells
                <SortIcon field="sells" />
              </div>
            </th>
            <th 
              className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleSort('activeHolds')}
              data-testid="header-holds"
            >
              <div className="flex items-center justify-end gap-1">
                Holds
                <SortIcon field="activeHolds" />
              </div>
            </th>
            <th className="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedEntries.map((entry, index) => {
            const meta = getStrategyMeta(entry.strategyId);
            const returnColor = entry.percentReturn >= 0 ? 'text-green-600' : 'text-red-600';
            const rowClasses = getRowColorClasses(entry.strategyId);
            
            return (
              <tr 
                key={`${entry.strategyId}-${index}`} 
                className={`${rowClasses} hover:opacity-80 transition-opacity`}
                data-testid={`row-leaderboard-${entry.strategyId}`}
              >
                <td className="px-4 py-3">
                  <Link href={`/strategy/${entry.strategyId}`}>
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: meta.chartColor }}
                      />
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors" data-testid={`link-strategy-${entry.strategyId}`}>
                        {meta.name} ({meta.strategy})
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-gray-900">{formatCurrency(entry.cash)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono font-medium text-gray-900">{formatCurrency(entry.accountValue)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-mono font-medium ${returnColor}`}>{formatPercent(entry.percentReturn)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-gray-900" data-testid={`win-rate-${entry.strategyId}`}>
                    {entry.winRate !== undefined ? `${entry.winRate}%` : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-gray-900">{entry.totalTrades}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-green-600">{entry.buys}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-red-600">{entry.sells}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-mono text-gray-900">{entry.activeHolds}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/strategy/${entry.strategyId}`}>
                    <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" data-testid={`button-view-strategy-${entry.strategyId}`} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
