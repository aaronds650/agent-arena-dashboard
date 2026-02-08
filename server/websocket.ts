import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

const EXTERNAL_API_URL = 'https://modular-trade-ai--aaronds650.replit.app';
const BROADCAST_INTERVAL_MS = 3000;

async function fetchExternalState(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${EXTERNAL_API_URL}/api/state`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws'
  });

  const clients = new Set<WebSocket>();

  wss.on('connection', async (ws: WebSocket) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    const state = await fetchExternalState();
    if (state) {
      ws.send(JSON.stringify({
        type: 'state',
        data: state,
        timestamp: Date.now(),
      }));
    }

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  const broadcastState = async () => {
    if (clients.size === 0) return;

    const state = await fetchExternalState();
    if (!state) return;

    const message = JSON.stringify({
      type: 'state',
      data: state,
      timestamp: Date.now(),
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  setInterval(broadcastState, BROADCAST_INTERVAL_MS);

  console.log('WebSocket server initialized on /ws');
  
  return wss;
}
