# Pro-Grade Trading Dashboard

## Overview

This is an institutional-grade cryptocurrency trading dashboard for monitoring AI trading agents competing in crypto markets. The application displays real-time equity curves, leaderboards, live positions, and decision logs for 7 distinct AI trading strategies (Grok, OpenAI, and Gemini variants). The dashboard follows Bloomberg Terminal and TradingView design principles with a focus on data density, visual clarity, and professional hierarchy.

## Recent Changes (December 2025)

- **Simplified Header**: Header now shows only "AI Crypto Arena" title and Engine Status badge - removed playback controls and aggregate metrics for cleaner professional layout
- **Enhanced Hero Zone**: Removed "Equity Curve" label; Y-axis displays absolute account values; timeframe controls preserved
- **Per-Strategy Performance Tab**: Default view with columns: Agent/Strategy, Cash Balance, Total Value, Return %, Trades, Buys, Sells, Holds - sorted by Total Value descending
- **Branded Agent Card Styling**: Consistent visual treatment across all components with 20% opacity backgrounds and solid left borders
- **Grouped Positions Tab**: Positions now grouped by strategy with branded header cards showing strategy name, position count, and total unrealized PnL
- **Per-Asset View Modal**: Shows Z-Score, Slope, VWAP Distance with strategy signals from all 7 AI agents
- **Pattern Strategy Colors**: Updated to 500-level colors (orange, violet, cyan) for improved contrast
- **WebSocket Support**: Real-time data streaming via WebSocket with automatic fallback to HTTP polling
- **Resizable Panels**: Drag-to-resize layout for adjusting equity curve and detail sections
- **Per-Strategy Detail Pages**: Individual strategy pages accessible via /strategy/:id with deep analytics
- **Data Export**: CSV/JSON export functionality for positions, decisions, and leaderboard data
- **Advanced Chart Controls**: Timeframe selection (1H/4H/8H/All), zoom via Brush component
- **Live API Integration**: Dashboard connects to external Python backend via `VITE_API_URL` environment variable with automatic data normalization (snake_case to camelCase), timestamp conversion, and robust error handling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Charts**: Recharts for equity curve visualization with Brush for zoom/pan
- **Real-time Data**: 
  - `useRealtimeData` hook with auto mode (WebSocket preferred, HTTP polling fallback)
  - `useWebSocket` hook for WebSocket connection management with auto-reconnection
  - `useApiPolling` hook for HTTP polling at configurable intervals
  - `usePlayback` hook for historical snapshot storage and playback

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints serving JSON data
- **WebSocket Server**: Real-time broadcasts on `/ws` endpoint every 1 second
- **Mock Data**: Server generates realistic trading data for 7 AI strategies
- **Build Process**: Custom build script using esbuild for server bundling, Vite for client

### Data Flow
1. Frontend connects to API endpoint (`${VITE_API_URL}/api/state`) via polling (3s intervals)
2. When using external API (VITE_API_URL set), WebSocket is automatically disabled
3. Data is normalized from Python snake_case to JavaScript camelCase
4. Timestamps are auto-detected (ISO strings, seconds, or milliseconds) and normalized
5. Data is transformed and displayed across dashboard components (equity chart, tables, modals)

### Backend API Format (Current)
The Python backend provides the following structure:
- `leaderboard`: Array of strategy performance with `strategy_id` (e.g., "Gemini_Comprehensive"), `buys`, `sells`, `holds`, `trades`, `cash_balance`, `total_value`, `return_pct`
- `pnl_history`: Array of timestamp objects with all strategy values as properties (e.g., `{timestamp: "ISO", Gemini_Comprehensive: 10000, Grok_Pattern: 9998, ...}`)
- `live_positions`: Array of open positions with `agent`, `strategy`, `asset`, `qty`, `entry_price`, `current_price`, `pnl`
- `decision_log`: Array of AI reasoning entries with `agent`, `strategy`, `asset`, `action`, `rationale`
- `trade_history`: Array of executed trades with `agent`, `strategy`, `asset`, `action`, `qty`, `price`

### API Configuration
- Set `VITE_API_URL` environment variable to connect to external Python backend
- Example: `VITE_API_URL=https://your-trading-engine.com`
- If not set, falls back to local mock server with WebSocket support
- Console logs "Connecting to Engine at: [URL]" on startup for debugging

### Component Structure
- **Dashboard Layout**: 
  - Header (metrics + connection status)
  - PlaybackControls (play/pause, step, seek, speed, live toggle)
  - Resizable Hero Zone (equity curve with timeframe controls)
  - Resizable Detail Zone (tabbed tables with export)
- **Strategy Identification**: 7 trading strategies with distinct color coding
- **Modal System**: Per-asset view showing all strategy signals for a selected asset
- **Strategy Detail Pages**: `/strategy/:id` routes with individual strategy analytics

### Key Files
- `client/src/hooks/useRealtimeData.ts` - Main data hook with WebSocket/polling switching
- `client/src/hooks/useWebSocket.ts` - WebSocket connection management
- `client/src/hooks/usePlayback.ts` - Historical snapshot storage and playback
- `client/src/components/dashboard/PlaybackControls.tsx` - Playback UI
- `client/src/components/dashboard/EquityCurve.tsx` - Chart with timeframe controls
- `client/src/lib/export.ts` - CSV/JSON export utilities
- `client/src/lib/api.ts` - API client with data normalization for Python backend
- `server/websocket.ts` - WebSocket server setup (local mock only)

### Design System
- Light/white background theme with colors reserved for agent identification
- Typography: Inter/Roboto for UI, JetBrains Mono for numerical data
- Color-coded elements for strategy identification in tables and charts

## External Dependencies

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Current State**: Schema defined but using in-memory storage for mock data

### Third-Party Services
- **Python Trading Engine**: Connects to external backend via `VITE_API_URL` environment variable
- API endpoint: `${VITE_API_URL}/api/state`
- Supports both camelCase and snake_case response formats

### Key NPM Packages
- **UI Components**: Radix UI primitives, shadcn/ui, Lucide icons
- **Data Visualization**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **WebSocket**: ws (server-side)
