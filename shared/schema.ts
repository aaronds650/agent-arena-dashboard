import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const STRATEGY_IDS = [
  'Grok_Comprehensive',
  'Grok_Pattern', 
  'Grok_Ichimoku',
  'OpenAI_Comprehensive',
  'OpenAI_Pattern',
  'Gemini_Comprehensive',
  'Gemini_Pattern'
] as const;

export type StrategyId = typeof STRATEGY_IDS[number];

export interface AgentMetadata {
  id: StrategyId;
  name: string;
  strategy: string;
  color: string;
  borderClass: string;
  chartColor: string;
}

export interface PnlHistoryPoint {
  timestamp: string;
  value: number;
  strategyId: StrategyId;
}

export interface LivePosition {
  id: string;
  asset: string;
  strategyId: StrategyId;
  qty: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  originalThesis: string;
}

export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  strategyId: StrategyId;
  asset: string;
  action: string;
  rationale: string;
}

export interface TradeHistoryEntry {
  id: string;
  timestamp: string;
  strategyId: StrategyId;
  asset: string;
  action: 'BUY' | 'SELL';
  qty: number;
  price: number;
  realizedPnl: number;
}

export interface LeaderboardEntry {
  rank: number;
  strategyId: StrategyId;
  accountValue: number;
  percentReturn: number;
  totalPnl: number;
  cash: number;
  totalTrades: number;
  buys: number;
  sells: number;
  activeHolds: number;
  winRate?: number;
}

export interface AssetMathSignal {
  asset: string;
  price: number;
  zScore: number;
  slope: number;
  vwapDist: number;
}

export interface ApiState {
  agentMetadata: AgentMetadata[];
  pnlHistory: PnlHistoryPoint[];
  livePositions: LivePosition[];
  decisionLog: DecisionLogEntry[];
  tradeHistory: TradeHistoryEntry[];
  leaderboard: LeaderboardEntry[];
  assetMathGrid: AssetMathSignal[];
  aggregatePnl: number;
  totalAccountValue: number;
  engineStatus: string;
}

export const AGENT_METADATA: AgentMetadata[] = [
  { id: 'Grok_Comprehensive', name: 'Grok', strategy: 'Comprehensive', color: 'Medium Red', borderClass: 'border-red-700', chartColor: '#b91c1c' },
  { id: 'Grok_Pattern', name: 'Grok', strategy: 'Pattern', color: 'Orange', borderClass: 'border-orange-500', chartColor: '#f97316' },
  { id: 'Grok_Ichimoku', name: 'Grok', strategy: 'Ichimoku', color: 'Black', borderClass: 'border-gray-900', chartColor: '#111827' },
  { id: 'OpenAI_Comprehensive', name: 'OpenAI', strategy: 'Comprehensive', color: 'Medium Green', borderClass: 'border-green-700', chartColor: '#15803d' },
  { id: 'OpenAI_Pattern', name: 'OpenAI', strategy: 'Pattern', color: 'Violet', borderClass: 'border-violet-500', chartColor: '#8b5cf6' },
  { id: 'Gemini_Comprehensive', name: 'Gemini', strategy: 'Comprehensive', color: 'Medium Blue', borderClass: 'border-blue-700', chartColor: '#1d4ed8' },
  { id: 'Gemini_Pattern', name: 'Gemini', strategy: 'Pattern', color: 'Cyan', borderClass: 'border-cyan-500', chartColor: '#06b6d4' },
];

export function getStrategyMeta(strategyId: StrategyId): AgentMetadata {
  return AGENT_METADATA.find(m => m.id === strategyId) || AGENT_METADATA[0];
}
