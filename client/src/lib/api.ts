import type { ApiState, PnlHistoryPoint, LivePosition, DecisionLogEntry, TradeHistoryEntry, LeaderboardEntry } from "@shared/schema";

const API_BASE_URL = '';

if (typeof window !== 'undefined') {
  console.log('Dashboard API connected to local backend proxy');
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function normalizeTimestampToSeconds(ts: unknown): number {
  const num = toNumber(ts);
  if (num > 10000000000000) {
    return Math.floor(num / 1000);
  }
  return num;
}

function normalizePnlHistory(data: unknown[]): PnlHistoryPoint[] {
  if (!Array.isArray(data)) return [];
  const points: PnlHistoryPoint[] = [];
  
  data.forEach((rawItem) => {
    const item = rawItem as Record<string, unknown>;
    const timestamp = String(item.timestamp || '');
    
    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'timestamp' && typeof value === 'number') {
        points.push({
          timestamp,
          value,
          strategyId: key as PnlHistoryPoint['strategyId'],
        });
      }
    });
  });
  
  return points;
}

function mapAgentName(agent: string): string {
  if (agent === 'ChatGPT') return 'OpenAI';
  return agent;
}

function buildStrategyId(agent: string, strategy: string): string {
  const mappedAgent = mapAgentName(agent);
  return `${mappedAgent}_${strategy}`;
}

function parseISOTimestamp(ts: unknown): number {
  if (typeof ts === 'string' && ts.includes('T')) {
    const date = new Date(ts);
    return Math.floor(date.getTime() / 1000);
  }
  return normalizeTimestampToSeconds(ts);
}

function normalizePositions(data: unknown[]): LivePosition[] {
  if (!Array.isArray(data)) return [];
  return data.map((rawItem, index) => {
    const item = rawItem as Record<string, unknown>;
    const agent = String(item.agent || '');
    const strategy = String(item.strategy || '');
    const strategyId = item.strategyId || item.strategy_id || (agent && strategy ? buildStrategyId(agent, strategy) : '');
    
    return {
      id: String(item.id || `pos-${index}`),
      asset: String(item.asset || item.symbol || ''),
      strategyId: String(strategyId) as LivePosition['strategyId'],
      qty: toNumber(item.qty || item.quantity || item.size),
      entryPrice: toNumber(item.entryPrice || item.entry_price),
      currentPrice: toNumber(item.currentPrice || item.current_price),
      pnl: toNumber(item.pnl || item.unrealized_pnl),
      originalThesis: String(item.originalThesis || item.original_thesis || item.thesis || ''),
    };
  });
}

function normalizeDecisionLog(data: unknown[]): DecisionLogEntry[] {
  if (!Array.isArray(data)) return [];
  return data.map((rawItem) => {
    const item = rawItem as Record<string, unknown>;
    const agent = String(item.agent || '');
    const strategy = String(item.strategy || '');
    const strategyId = item.strategyId || item.strategy_id || (agent && strategy ? buildStrategyId(agent, strategy) : '');
    const timestamp = String(item.timestamp || '');
    // Use stable ID based on timestamp+strategy to prevent React key changes causing flashing
    const stableId = item.id || `${timestamp}-${strategyId}`;
    
    return {
      id: String(stableId),
      timestamp,
      strategyId: String(strategyId) as DecisionLogEntry['strategyId'],
      asset: String(item.asset || item.symbol || ''),
      action: String(item.action || 'HOLD') as DecisionLogEntry['action'],
      rationale: String(item.rationale || item.reasoning || ''),
    };
  });
}

function normalizeTradeHistory(data: unknown[]): TradeHistoryEntry[] {
  if (!Array.isArray(data)) return [];
  return data.map((rawItem) => {
    const item = rawItem as Record<string, unknown>;
    const agent = String(item.agent || '');
    const strategy = String(item.strategy || '');
    const strategyId = item.strategyId || item.strategy_id || (agent && strategy ? buildStrategyId(agent, strategy) : '');
    const timestamp = String(item.timestamp || '');
    const action = String(item.action || 'BUY').toUpperCase() as 'BUY' | 'SELL';
    // Use stable ID based on timestamp+strategy+action to prevent React key changes
    const stableId = item.id || `${timestamp}-${strategyId}-${action}`;
    
    return {
      id: String(stableId),
      timestamp,
      strategyId: String(strategyId) as TradeHistoryEntry['strategyId'],
      asset: String(item.asset || item.symbol || ''),
      action,
      qty: toNumber(item.qty || item.quantity || item.size),
      price: toNumber(item.price || item.entry_price),
      realizedPnl: toNumber(item.realizedPnl || item.realized_pnl || item.pnl),
    };
  });
}

function normalizeLeaderboard(data: unknown[]): LeaderboardEntry[] {
  if (!Array.isArray(data)) return [];
  
  return data.map((rawItem, index) => {
    const item = rawItem as Record<string, unknown>;
    const strategyId = String(item.strategy_id || item.strategyId || '');
    
    return {
      rank: toNumber(item.rank) || index + 1,
      strategyId: strategyId as LeaderboardEntry['strategyId'],
      accountValue: toNumber(item.total_value || item.accountValue || item.account_value),
      percentReturn: toNumber(item.return_pct || item.percentReturn || item.percent_return),
      totalPnl: toNumber(item.total_value || 10000) - 10000,
      cash: toNumber(item.cash_balance || item.cash),
      totalTrades: toNumber(item.trades || item.total_trades || item.totalTrades),
      buys: toNumber(item.buys),
      sells: toNumber(item.sells || item.closes),
      activeHolds: toNumber(item.holds || item.activeHolds || item.active_holds),
      winRate: item.win_rate !== undefined ? toNumber(item.win_rate) : undefined,
    };
  });
}

function normalizeAgentMetadata(data: unknown[]): ApiState['agentMetadata'] {
  if (!Array.isArray(data)) return [];
  return data.map((rawItem) => {
    const item = rawItem as Record<string, unknown>;
    return {
      id: String(item.id || '') as ApiState['agentMetadata'][number]['id'],
      name: String(item.name || ''),
      strategy: String(item.strategy || ''),
      color: String(item.color || ''),
      borderClass: String(item.borderClass || item.border_class || ''),
      chartColor: String(item.chartColor || item.chart_color || ''),
    };
  });
}

function generatePnlHistoryFromAgents(agentsData: unknown[]): PnlHistoryPoint[] {
  if (!Array.isArray(agentsData) || agentsData.length === 0) return [];
  
  const now = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Denver'
  });
  const points: PnlHistoryPoint[] = [];
  
  agentsData.forEach((rawAgent) => {
    const agent = rawAgent as Record<string, unknown>;
    const agentName = String(agent.agent || '');
    const strategy = String(agent.strategy || '');
    const strategyId = buildStrategyId(agentName, strategy);
    const totalValue = toNumber(agent.total_value);
    
    if (strategyId && totalValue > 0) {
      points.push({
        timestamp: now,
        value: totalValue,
        strategyId: strategyId as PnlHistoryPoint['strategyId'],
      });
    }
  });
  
  return points;
}

export function normalizeApiState(raw: Record<string, unknown>): ApiState {
  const agentsData = (raw.agents || []) as unknown[];
  const existingPnlHistory = (raw.pnlHistory || raw.pnl_history || []) as unknown[];
  
  const pnlHistory = existingPnlHistory.length > 0 
    ? normalizePnlHistory(existingPnlHistory)
    : generatePnlHistoryFromAgents(agentsData);
  
  return {
    agentMetadata: normalizeAgentMetadata((raw.agentMetadata || raw.agent_metadata || []) as unknown[]),
    pnlHistory,
    livePositions: normalizePositions((raw.livePositions || raw.live_positions || raw.positions || []) as unknown[]),
    decisionLog: normalizeDecisionLog((raw.decisionLog || raw.decision_log || raw.decisions || raw.activity_logs || []) as unknown[]),
    tradeHistory: normalizeTradeHistory((raw.tradeHistory || raw.trade_history || raw.trades || raw.recent_trades || []) as unknown[]),
    leaderboard: normalizeLeaderboard((raw.leaderboard || raw.strategy_performance || []) as unknown[]),
    assetMathGrid: Array.isArray(raw.assetMathGrid || raw.asset_math_grid || raw.assets)
      ? ((raw.assetMathGrid || raw.asset_math_grid || raw.assets) as Record<string, unknown>[]).map((item) => ({
          asset: String(item.asset || ''),
          price: toNumber(item.price),
          zScore: toNumber(item.zScore || item.z_score),
          slope: toNumber(item.slope),
          vwapDist: toNumber(item.vwapDist || item.vwap_dist || item.vwap_distance),
        }))
      : [],
    aggregatePnl: toNumber(raw.aggregatePnl || raw.aggregate_pnl),
    totalAccountValue: toNumber(raw.totalAccountValue || raw.total_account_value),
    engineStatus: String(
      raw.engineStatus || 
      raw.engine_status || 
      (raw.system_status as Record<string, unknown>)?.status || 
      'Unknown'
    ),
  };
}

export async function fetchApiState(): Promise<ApiState> {
  const url = `${API_BASE_URL}/api/state`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    // Parse error response from backend
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }
  
  const rawData = await response.json();
  
  // Detect if this is an error response (no leaderboard = likely error)
  if (rawData.error) {
    throw new Error(rawData.error);
  }
  
  return normalizeApiState(rawData);
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
