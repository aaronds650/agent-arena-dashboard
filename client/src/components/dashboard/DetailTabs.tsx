import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PositionsTable } from './PositionsTable';
import { TradeRationale } from './TradeRationale';
import { TradeHistory } from './TradeHistory';
import { Leaderboard } from './Leaderboard';
import { ExportMenu } from './ExportMenu';
import { exportToCSV, exportToJSON } from '@/lib/export';
import { getStrategyMeta } from '@shared/schema';
import type { LivePosition, DecisionLogEntry, TradeHistoryEntry, LeaderboardEntry } from '@shared/schema';
import { useState } from 'react';

interface DetailTabsProps {
  positions: LivePosition[];
  decisionLog: DecisionLogEntry[];
  tradeHistory: TradeHistoryEntry[];
  leaderboard: LeaderboardEntry[];
  onAssetClick: (asset: string) => void;
}

export function DetailTabs({ positions, decisionLog, tradeHistory, leaderboard, onAssetClick }: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  // Defensive: ensure arrays are always defined
  const safePositions = positions || [];
  const safeDecisionLog = decisionLog || [];
  const safeTradeHistory = tradeHistory || [];
  const safeLeaderboard = leaderboard || [];

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (activeTab === 'positions') {
      exportToCSV(safePositions.map(p => ({
        ...p,
        strategyName: getStrategyMeta(p.strategyId).name,
        strategyType: getStrategyMeta(p.strategyId).strategy,
      })), `positions_${timestamp}`, [
        { key: 'asset', label: 'Asset' },
        { key: 'strategyName', label: 'Strategy' },
        { key: 'strategyType', label: 'Type' },
        { key: 'qty', label: 'Quantity' },
        { key: 'entryPrice', label: 'Entry Price' },
        { key: 'currentPrice', label: 'Current Price' },
        { key: 'pnl', label: 'PnL' },
        { key: 'originalThesis', label: 'Thesis' },
      ]);
    } else if (activeTab === 'rationale') {
      exportToCSV(safeDecisionLog.map(d => ({
        ...d,
        strategyName: getStrategyMeta(d.strategyId).name,
        strategyType: getStrategyMeta(d.strategyId).strategy,
        formattedTime: new Date(d.timestamp * 1000).toISOString(),
      })), `trade_rationale_${timestamp}`, [
        { key: 'formattedTime', label: 'Timestamp' },
        { key: 'strategyName', label: 'Strategy' },
        { key: 'strategyType', label: 'Type' },
        { key: 'rationale', label: 'Rationale' },
      ]);
    } else if (activeTab === 'history') {
      exportToCSV(safeTradeHistory.map(t => ({
        ...t,
        strategyName: getStrategyMeta(t.strategyId).name,
        strategyType: getStrategyMeta(t.strategyId).strategy,
        formattedTime: new Date(t.timestamp * 1000).toISOString(),
      })), `trade_history_${timestamp}`, [
        { key: 'formattedTime', label: 'Timestamp' },
        { key: 'strategyName', label: 'Strategy' },
        { key: 'strategyType', label: 'Type' },
        { key: 'asset', label: 'Asset' },
        { key: 'action', label: 'Action' },
        { key: 'qty', label: 'Quantity' },
        { key: 'price', label: 'Price' },
        { key: 'realizedPnl', label: 'Realized PnL' },
      ]);
    } else if (activeTab === 'leaderboard') {
      exportToCSV(safeLeaderboard.map(l => ({
        ...l,
        strategyName: getStrategyMeta(l.strategyId).name,
        strategyType: getStrategyMeta(l.strategyId).strategy,
      })), `strategy_performance_${timestamp}`, [
        { key: 'strategyName', label: 'Agent / Strategy' },
        { key: 'cash', label: 'Cash Balance' },
        { key: 'accountValue', label: 'Total Value' },
        { key: 'percentReturn', label: 'Return %' },
        { key: 'totalTrades', label: 'Trades' },
        { key: 'buys', label: 'Buys' },
        { key: 'sells', label: 'Sells' },
        { key: 'activeHolds', label: 'Holds' },
      ]);
    }
  };

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (activeTab === 'positions') {
      exportToJSON(safePositions, `positions_${timestamp}`);
    } else if (activeTab === 'rationale') {
      exportToJSON(safeDecisionLog, `trade_rationale_${timestamp}`);
    } else if (activeTab === 'history') {
      exportToJSON(safeTradeHistory, `trade_history_${timestamp}`);
    } else if (activeTab === 'leaderboard') {
      exportToJSON(safeLeaderboard, `strategy_performance_${timestamp}`);
    }
  };

  const getCurrentDataLength = () => {
    if (activeTab === 'positions') return safePositions.length;
    if (activeTab === 'rationale') return safeDecisionLog.length;
    if (activeTab === 'history') return safeTradeHistory.length;
    if (activeTab === 'leaderboard') return safeLeaderboard.length;
    return 0;
  };

  return (
    <div className="h-full flex flex-col bg-white border-t border-gray-200" data-testid="detail-tabs-container">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-gray-200 flex items-center justify-between gap-2">
          <div className="flex-1 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] scrollbar-hide">
            <TabsList className="h-12 bg-transparent border-0 p-0 gap-0 flex-nowrap w-max px-4">
              <TabsTrigger 
                value="leaderboard" 
                className="px-4 sm:px-6 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 whitespace-nowrap"
                data-testid="tab-leaderboard"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="positions" 
                className="px-4 sm:px-6 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 whitespace-nowrap"
                data-testid="tab-positions"
              >
                Positions ({safePositions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="px-4 sm:px-6 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 whitespace-nowrap"
                data-testid="tab-history"
              >
                History ({safeTradeHistory.length})
              </TabsTrigger>
              <TabsTrigger 
                value="rationale" 
                className="px-4 sm:px-6 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 whitespace-nowrap"
                data-testid="tab-rationale"
              >
                Rationale ({safeDecisionLog.length})
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-shrink-0 pr-4">
            <ExportMenu 
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              disabled={getCurrentDataLength() === 0}
            />
          </div>
        </div>
        
        <TabsContent value="positions" className="flex-1 m-0 overflow-hidden" data-testid="tab-content-positions">
          <PositionsTable positions={safePositions} onAssetClick={onAssetClick} />
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 m-0 overflow-hidden" data-testid="tab-content-history">
          <TradeHistory entries={safeTradeHistory} />
        </TabsContent>
        
        <TabsContent value="rationale" className="flex-1 m-0 overflow-hidden bg-gray-50" data-testid="tab-content-rationale">
          <TradeRationale entries={safeDecisionLog} />
        </TabsContent>
        
        <TabsContent value="leaderboard" className="flex-1 m-0 overflow-hidden" data-testid="tab-content-leaderboard">
          <Leaderboard entries={safeLeaderboard} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
