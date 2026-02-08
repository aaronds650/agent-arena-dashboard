import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ApiState } from '@shared/schema';
import { useApiPolling } from './useApiPolling';
import { useWebSocket } from './useWebSocket';
import { getApiBaseUrl } from '@/lib/api';

type ConnectionMode = 'polling' | 'websocket' | 'auto';

interface UseRealtimeDataResult {
  data: ApiState | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  connectionMode: ConnectionMode;
  isConnected: boolean;
  isExternalApi: boolean;
  setConnectionMode: (mode: ConnectionMode) => void;
  refetch: () => Promise<void>;
}

export function useRealtimeData(preferredMode: ConnectionMode = 'auto'): UseRealtimeDataResult {
  const isExternalApi = useMemo(() => {
    const apiUrl = getApiBaseUrl();
    return apiUrl.length > 0 && !apiUrl.includes(window.location.host);
  }, []);

  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(preferredMode);
  const [effectiveMode, setEffectiveMode] = useState<'polling' | 'websocket'>('polling');

  const pollingResult = useApiPolling(effectiveMode === 'polling' ? 3000 : 0);
  const wsResult = useWebSocket(!isExternalApi);

  useEffect(() => {
    if (isExternalApi) {
      setEffectiveMode('polling');
      return;
    }

    if (connectionMode === 'auto') {
      if (wsResult.isConnected) {
        setEffectiveMode('websocket');
      } else {
        setEffectiveMode('polling');
      }
    } else if (connectionMode === 'websocket') {
      setEffectiveMode('websocket');
    } else {
      setEffectiveMode('polling');
    }
  }, [connectionMode, wsResult.isConnected, isExternalApi]);

  const data = effectiveMode === 'websocket' ? wsResult.data : pollingResult.data;
  const error = effectiveMode === 'websocket' ? wsResult.error : pollingResult.error;
  const lastUpdated = effectiveMode === 'websocket' ? wsResult.lastUpdated : pollingResult.lastUpdated;
  const isConnected = effectiveMode === 'websocket' ? wsResult.isConnected : !pollingResult.error;
  const isLoading = !data && !error;

  const refetch = useCallback(async () => {
    if (effectiveMode === 'polling') {
      await pollingResult.refetch();
    } else {
      wsResult.reconnect();
    }
  }, [effectiveMode, pollingResult, wsResult]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    connectionMode: effectiveMode,
    isConnected,
    isExternalApi,
    setConnectionMode,
    refetch,
  };
}
