import { useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Target, Clock, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiPolling } from '@/hooks/useApiPolling';
import { getStrategyMeta, AGENT_METADATA } from '@shared/schema';
import type { StrategyId, LivePosition, DecisionLogEntry, PnlHistoryPoint, LeaderboardEntry } from '@shared/schema';
import { formatTimeWithSeconds } from '@/lib/formatTime';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPnl(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}


interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: typeof TrendingUp;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${trendColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold font-mono ${trendColor}`}>{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function StrategyDetail() {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { data, isLoading, error } = useApiPolling(3000);

  const meta = useMemo(() => {
    if (!strategyId) return null;
    return getStrategyMeta(strategyId as StrategyId);
  }, [strategyId]);

  const leaderboardEntry = useMemo(() => {
    if (!data || !strategyId) return null;
    return data.leaderboard.find(e => e.strategyId === strategyId);
  }, [data, strategyId]);

  const strategyPositions = useMemo(() => {
    if (!data || !strategyId) return [];
    return data.livePositions.filter(p => p.strategyId === strategyId);
  }, [data, strategyId]);

  const strategyDecisions = useMemo(() => {
    if (!data || !strategyId) return [];
    return data.decisionLog.filter(d => d.strategyId === strategyId);
  }, [data, strategyId]);

  const equityData = useMemo(() => {
    if (!data || !strategyId) return [];
    return data.pnlHistory
      .filter(p => p.strategyId === strategyId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(p => ({
        timestamp: p.timestamp,
        formattedTime: new Date(p.timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Denver' }),
        value: p.value,
      }));
  }, [data, strategyId]);

  const performanceMetrics = useMemo(() => {
    if (!equityData.length || !leaderboardEntry) return null;
    
    const values = equityData.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const currentValue = values[values.length - 1];
    const startValue = values[0];
    
    const drawdown = ((maxValue - currentValue) / maxValue) * 100;
    const volatility = Math.sqrt(
      values.reduce((acc, v, i, arr) => {
        if (i === 0) return 0;
        const ret = (v - arr[i - 1]) / arr[i - 1];
        return acc + ret * ret;
      }, 0) / (values.length - 1)
    ) * 100;
    
    return {
      currentValue,
      startValue,
      maxValue,
      minValue,
      drawdown,
      volatility,
      totalReturn: leaderboardEntry.percentReturn,
      totalPnl: leaderboardEntry.totalPnl,
      positionCount: strategyPositions.length,
      decisionCount: strategyDecisions.length,
    };
  }, [equityData, leaderboardEntry, strategyPositions, strategyDecisions]);

  if (!strategyId || !meta) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Strategy Not Found</h2>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-500">Loading strategy data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Error Loading Data</h2>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="strategy-detail-page">
      <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: meta.chartColor }}
            />
            <h1 className="text-xl font-bold text-gray-900" data-testid="text-strategy-name">
              {meta.name} ({meta.strategy})
            </h1>
            {leaderboardEntry && (
              <Badge variant="secondary" className="font-mono" data-testid="badge-rank">
                Rank #{leaderboardEntry.rank}
              </Badge>
            )}
          </div>
        </div>
        
        {performanceMetrics && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Account Value:</span>
              <span className="font-mono font-medium text-gray-900">
                {formatCurrency(performanceMetrics.currentValue)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total Return:</span>
              <span className={`font-mono font-medium ${performanceMetrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(performanceMetrics.totalReturn)}
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="p-6 space-y-6">
        {performanceMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="metrics-grid">
            <MetricCard
              title="Total PnL"
              value={formatPnl(performanceMetrics.totalPnl)}
              icon={DollarSign}
              trend={performanceMetrics.totalPnl >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              title="Total Return"
              value={formatPercent(performanceMetrics.totalReturn)}
              icon={performanceMetrics.totalReturn >= 0 ? TrendingUp : TrendingDown}
              trend={performanceMetrics.totalReturn >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              title="Max Drawdown"
              value={`-${performanceMetrics.drawdown.toFixed(2)}%`}
              icon={TrendingDown}
              trend="down"
            />
            <MetricCard
              title="Volatility"
              value={`${performanceMetrics.volatility.toFixed(2)}%`}
              icon={Activity}
              trend="neutral"
            />
            <MetricCard
              title="Open Positions"
              value={performanceMetrics.positionCount.toString()}
              icon={Target}
              trend="neutral"
            />
            <MetricCard
              title="Decisions Today"
              value={performanceMetrics.decisionCount.toString()}
              icon={Clock}
              trend="neutral"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id={`gradient-${strategyId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={meta.chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={meta.chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="formattedTime" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis 
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Account Value']}
                  labelStyle={{ color: '#6b7280' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={meta.chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${strategyId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="positions" data-testid="tab-strategy-positions">
              Open Positions ({strategyPositions.length})
            </TabsTrigger>
            <TabsTrigger value="decisions" data-testid="tab-strategy-decisions">
              Decision History ({strategyDecisions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card>
              <CardContent className="p-0">
                {strategyPositions.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-500">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">No Open Positions</p>
                      <p className="text-xs text-gray-400 mt-1">This strategy has no active trades</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <table className="w-full" data-testid="strategy-positions-table">
                      <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Asset</th>
                          <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Qty</th>
                          <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Entry</th>
                          <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Current</th>
                          <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">PnL</th>
                          <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Thesis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {strategyPositions.map((pos) => (
                          <tr key={pos.id} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{pos.asset}</td>
                            <td className="px-4 py-3 text-sm font-mono text-right text-gray-900">{pos.qty}</td>
                            <td className="px-4 py-3 text-sm font-mono text-right text-gray-900">{formatCurrency(pos.entryPrice)}</td>
                            <td className="px-4 py-3 text-sm font-mono text-right text-gray-900">{formatCurrency(pos.currentPrice)}</td>
                            <td className={`px-4 py-3 text-sm font-mono text-right font-medium ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPnl(pos.pnl)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={pos.originalThesis}>
                              {pos.originalThesis}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions">
            <Card>
              <CardContent className="p-0">
                {strategyDecisions.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-500">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">No Recent Decisions</p>
                      <p className="text-xs text-gray-400 mt-1">Decision history will appear here</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <div className="space-y-3 p-4" data-testid="strategy-decisions-list">
                      {strategyDecisions.map((decision) => (
                        <div 
                          key={decision.id}
                          className={`border-l-4 ${meta.borderClass} bg-gray-50 rounded-r-lg p-4`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Decision
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTimeWithSeconds(decision.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {decision.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
