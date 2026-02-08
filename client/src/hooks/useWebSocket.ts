import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiState, DecisionLogEntry, TradeHistoryEntry } from '@shared/schema';
import { normalizeApiState } from '@/lib/api';

const MAX_LOG_ENTRIES = 50;

function mergeDecisionLogs(
  prevLogs: DecisionLogEntry[] | undefined,
  newLogs: DecisionLogEntry[] | undefined
): DecisionLogEntry[] {
  const safePrevLogs = prevLogs || [];
  const safeNewLogs = newLogs || [];
  const existingKeys = new Set(safePrevLogs.map(log => `${log.timestamp}-${log.strategyId}`));
  const newEntries = safeNewLogs.filter(
    log => !existingKeys.has(`${log.timestamp}-${log.strategyId}`)
  );
  return [...newEntries, ...safePrevLogs].slice(0, MAX_LOG_ENTRIES);
}

function mergeTradeHistory(
  prevTrades: TradeHistoryEntry[] | undefined,
  newTrades: TradeHistoryEntry[] | undefined
): TradeHistoryEntry[] {
  const safePrevTrades = prevTrades || [];
  const safeNewTrades = newTrades || [];
  const existingKeys = new Set(safePrevTrades.map(t => `${t.timestamp}-${t.strategyId}-${t.action}`));
  const newEntries = safeNewTrades.filter(
    t => !existingKeys.has(`${t.timestamp}-${t.strategyId}-${t.action}`)
  );
  return [...newEntries, ...safePrevTrades].slice(0, MAX_LOG_ENTRIES);
}

interface UseWebSocketResult {
  data: ApiState | null;
  isConnected: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  reconnect: () => void;
}

export function useWebSocket(enabled: boolean = true): UseWebSocketResult {
  const [data, setData] = useState<ApiState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'state' && message.data) {
            const rawData = message.data as Record<string, unknown>;
            const newData = normalizeApiState(rawData);
            console.log('WebSocket received data with', newData.leaderboard?.length || 0, 'leaderboard entries');
            setData(prevData => {
              if (!prevData) {
                // First load - set everything including decisionLog
                return newData;
              }
              
              // Subsequent updates: Keep original decisionLog STATIC (no flashing/cycling)
              // Only update real-time data (positions, leaderboard, prices)
              // Trade history accumulates, but decision log stays frozen
              return {
                ...newData,
                decisionLog: prevData.decisionLog, // STATIC - never update after first load
                tradeHistory: mergeTradeHistory(prevData.tradeHistory, newData.tradeHistory),
              };
            });
            setLastUpdated(new Date(message.timestamp));
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (!enabled) {
          // WebSocket disabled, don't reconnect
        } else {
          setError(new Error('Max reconnection attempts reached'));
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError(err instanceof Error ? err : new Error('Failed to create WebSocket'));
    }
  }, [enabled]);

  const reconnect = useCallback(() => {
    if (!enabled) return;
    reconnectAttempts.current = 0;
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect, enabled]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, enabled]);

  return { data, isConnected, error, lastUpdated, reconnect };
}
