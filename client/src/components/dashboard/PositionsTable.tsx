import { useMemo } from 'react';
import type { LivePosition, StrategyId } from '@shared/schema';
import { getStrategyMeta, AGENT_METADATA } from '@shared/schema';

function getGroupColorClasses(strategyId: string): string {
  if (strategyId.startsWith('Grok')) {
    if (strategyId === 'Grok_Ichimoku') return 'bg-gray-900/20 border-2 border-gray-900';
    if (strategyId === 'Grok_Pattern') return 'bg-orange-500/20 border-2 border-orange-500';
    return 'bg-red-700/20 border-2 border-red-700';
  }
  if (strategyId.startsWith('OpenAI')) {
    if (strategyId === 'OpenAI_Pattern') return 'bg-violet-500/20 border-2 border-violet-500';
    return 'bg-green-700/20 border-2 border-green-700';
  }
  if (strategyId.startsWith('Gemini')) {
    if (strategyId === 'Gemini_Pattern') return 'bg-cyan-500/20 border-2 border-cyan-500';
    return 'bg-blue-700/20 border-2 border-blue-700';
  }
  return 'bg-gray-100/20 border-2 border-gray-300';
}

interface PositionsTableProps {
  positions: LivePosition[];
  onAssetClick: (asset: string) => void;
}

interface StrategyGroup {
  strategyId: StrategyId;
  positions: LivePosition[];
  totalPnl: number;
  positionCount: number;
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

export function PositionsTable({ positions, onAssetClick }: PositionsTableProps) {
  const groupedPositions = useMemo(() => {
    const groups: Map<StrategyId, StrategyGroup> = new Map();
    
    positions.forEach((position) => {
      const existing = groups.get(position.strategyId);
      if (existing) {
        existing.positions.push(position);
        existing.totalPnl += position.pnl;
        existing.positionCount += 1;
      } else {
        groups.set(position.strategyId, {
          strategyId: position.strategyId,
          positions: [position],
          totalPnl: position.pnl,
          positionCount: 1,
        });
      }
    });
    
    const sortedGroups = Array.from(groups.values()).sort((a, b) => b.totalPnl - a.totalPnl);
    return sortedGroups;
  }, [positions]);

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500" data-testid="positions-empty">
        <div className="text-center">
          <p className="text-sm font-medium">No Open Positions</p>
          <p className="text-xs text-gray-400 mt-1">Positions will appear here when agents open trades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-auto [-webkit-overflow-scrolling:touch] p-4 space-y-4" data-testid="positions-table-container">
        {groupedPositions.map((group) => {
          const meta = getStrategyMeta(group.strategyId);
          const groupClasses = getGroupColorClasses(group.strategyId);
          const pnlColor = group.totalPnl >= 0 ? 'text-green-600' : 'text-red-600';
          
          return (
            <div 
              key={group.strategyId} 
              className={`rounded-md overflow-hidden ${groupClasses}`}
              data-testid={`group-strategy-${group.strategyId}`}
            >
              <div className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: meta.chartColor }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900" data-testid={`text-strategy-name-${group.strategyId}`}>
                      {meta.name} ({meta.strategy})
                    </h3>
                    <p className="text-xs text-gray-600">
                      {group.positionCount} {group.positionCount === 1 ? 'Position' : 'Positions'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Unrealized PnL</p>
                  <p className={`text-lg font-mono font-bold ${pnlColor}`} data-testid={`text-group-pnl-${group.strategyId}`}>
                    {formatCurrency(group.totalPnl)}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">Asset</th>
                      <th className="text-right px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">Qty</th>
                      <th className="text-right px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">Entry</th>
                      <th className="text-right px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">Current</th>
                      <th className="text-right px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">PnL</th>
                      <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">Thesis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.positions.map((position) => {
                      const positionPnlColor = position.pnl >= 0 ? 'text-green-600' : 'text-red-600';
                      
                      return (
                        <tr 
                          key={position.id}
                          className="hover:bg-black/5 transition-colors"
                          data-testid={`row-position-${position.id}`}
                        >
                          <td className="px-4 py-2">
                            <button
                              onClick={() => onAssetClick(position.asset)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                              data-testid={`button-asset-${position.asset}`}
                            >
                              {position.asset}
                            </button>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-sm font-mono text-gray-900">{position.qty.toFixed(3)}</span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-sm font-mono text-gray-900">{formatPrice(position.entryPrice)}</span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-sm font-mono text-gray-900">{formatPrice(position.currentPrice)}</span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className={`text-sm font-mono font-medium ${positionPnlColor}`}>
                              {formatCurrency(position.pnl)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <p className="text-sm text-gray-600 max-w-xs truncate" title={position.originalThesis}>
                              {position.originalThesis}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
    </div>
  );
}
