import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiState, DecisionLogEntry, TradeHistoryEntry } from '@shared/schema';
import { fetchApiState } from '@/lib/api';

const MAX_LOG_ENTRIES = 50;

function mergeDecisionLogs(
  prevLogs: DecisionLogEntry[],
  newLogs: DecisionLogEntry[]
): DecisionLogEntry[] {
  const existingKeys = new Set(prevLogs.map(log => `${log.timestamp}-${log.strategyId}`));
  const newEntries = newLogs.filter(
    log => !existingKeys.has(`${log.timestamp}-${log.strategyId}`)
  );
  return [...newEntries, ...prevLogs].slice(0, MAX_LOG_ENTRIES);
}

function mergeTradeHistory(
  prevTrades: TradeHistoryEntry[],
  newTrades: TradeHistoryEntry[]
): TradeHistoryEntry[] {
  const existingKeys = new Set(prevTrades.map(t => `${t.timestamp}-${t.strategyId}-${t.action}`));
  const newEntries = newTrades.filter(
    t => !existingKeys.has(`${t.timestamp}-${t.strategyId}-${t.action}`)
  );
  return [...newEntries, ...prevTrades].slice(0, MAX_LOG_ENTRIES);
}

interface UseApiPollingResult {
  data: ApiState | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useApiPolling(intervalMs: number = 3000): UseApiPollingResult {
  const [data, setData] = useState<ApiState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refetch = useCallback(async () => {
    try {
      const result = await fetchApiState();
      setData(prevData => {
        if (!prevData) {
          // First load - set everything including decisionLog
          return result;
        }
        
        // Subsequent updates: Keep original decisionLog STATIC (no flashing/cycling)
        // Only update real-time data (positions, leaderboard, prices)
        // Trade history accumulates, but decision log stays frozen
        return {
          ...result,
          decisionLog: prevData.decisionLog, // STATIC - never update after first load
          tradeHistory: mergeTradeHistory(prevData.tradeHistory, result.tradeHistory),
        };
      });
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (intervalMs <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    refetch();

    intervalRef.current = setInterval(refetch, intervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refetch, intervalMs]);

  return { data, isLoading, error, lastUpdated, refetch };
}
