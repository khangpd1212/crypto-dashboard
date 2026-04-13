# Crypto Market Dashboard - Architecture Specification

## 1. Project Overview

**Project Name:** Crypto Market Dashboard  
**Type:** Real-time Web Application (SPA)  
**Tech Stack:** TypeScript, React, MobX, SatchelJS, WebSocket, TailwindCSS, Lightweight Charts

## 2. Architecture Pattern - SatchelJS

### Store Structure (`src/stores/`)
```
stores/
├── marketStore.ts      # Ticker data, prices, market state
├── tokenStore.ts    # Selected token, search, details
├── settingsStore.ts # Language, theme, user preferences
└── uiStore.ts      # Loading states, errors, notifications
```

### Action Structure (`src/actions/`)
```
actions/
├── marketActions.ts    # updatePrice, setTickers, setError
├── tokenActions.ts    # selectToken, searchToken
├── settingsActions.ts # setLanguage, setTheme, setAvatar
└── uiActions.ts    # setLoading, showError, clearError
```

### Mutator Structure (`src/mutators/`)
```
mutators/
├── marketMutators.ts
├── tokenMutators.ts
├── settingsMutators.ts
└── uiMutators.ts
```

### Orchestrator Structure (`src/orchestrators/`)
```
orchestrators/
├── marketOrchestrator.ts   # REST fetch + WebSocket connect
├── tokenOrchestrator.ts
└── settingsOrchestrator.ts  # localStorage persistence
```

## 3. Component Architecture

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.tsx        # Main grid view
│   │   ├── TickerCard.tsx       # Individual ticker
│   │   ├── TickerRow.tsx         # Table row variant
│   │   └── PriceFlash.tsx       # Green/red flash animation
│   ├── TokenDetail/
│   │   ├── TokenDetail.tsx      # Detail page
│   │   ├── Chart.tsx            # K-line chart (Lightweight Charts)
│   │   ├── OrderBook.tsx        # Bonus: Bids/Asks
│   │   └── RecentTrades.tsx     # Bonus: Trade feed
│   ├── Settings/
│   │   ├── Settings.tsx         # Settings panel
│   │   ├── LanguageSelector.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── AvatarUploader.tsx
│   └── common/
│       ├── SearchBar.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ErrorBoundary.tsx
│       └── Toast.tsx
├── services/
│   ├── binanceApi.ts           # REST API client
│   ├── binanceWebSocket.ts    # WebSocket manager
│   └── storage.ts            # localStorage wrapper
├── i18n/
│   ├── en.json               # English translations
│   └── vi.json              # Vietnamese translations
└── types/
    └── binance.ts            # TypeScript types for API
```

## 4. TypeScript Type Definitions

```typescript
// src/types/binance.ts
interface Ticker {
  symbol: string;
  price: string;
  priceChangePercent: string;
  lastUpdate: number;
}

interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

interface OrderBook {
  bids: [string, string][];
  asks: [string, string][];
}

interface Trade {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}
```

## 5. WebSocket Connection Strategy

### Connections
- **Mini Ticker Stream:** `!miniTicker@arr` - All tickers, single connection
- **Kline Stream:** `<symbol>@kline_15m` - Per token detail
- **Depth Stream:** `<symbol>@depth20@100ms` - Order book (bonus)

### Reconnection Logic
- Exponential backoff: 1s, 2s, 4s, 8s, max 30s
- Max retries: 10
- Heartbeat ping every 30s

## 6. Performance Optimizations

- React.memo for TickerCard components
- Throttle WebSocket updates to 100ms
- Batch state updates in orchestrator
- Virtualized list for 100+ tickers

## 7. API Endpoints (Binance)

### REST
- `GET /api/v3/exchangeInfo` - Available pairs
- `GET /api/v3/klines?symbol=BTCUSDT&interval=15m&limit=100` - Historical klines

### WebSocket
- `wss://stream.binance.com:9443/ws/!miniTicker@arr` - All mini tickers
- `wss://stream.binance.com:9443/ws/btcusdt@kline_15m` - Kline updates

## 8. User Stories -> Architecture Mapping

| Story | Components | Store | Orchestrator |
|-------|------------|-------|-------------|
| 1. Dashboard Grid | Dashboard, TickerCard | marketStore | marketOrchestrator |
| 2. Token Search | SearchBar, TokenDetail | tokenStore | tokenOrchestrator |
| 3. K-line Chart | Chart (Lightweight Charts) | tokenStore | tokenOrchestrator |
| 4. Language Switch | Settings, LanguageSelector | settingsStore | settingsOrchestrator |
| Bonus: Order Book | OrderBook | tokenStore | tokenOrchestrator |
| Bonus: Favorites | TickerCard (star) | marketStore | marketOrchestrator |
| Bonus: Theme | ThemeToggle | settingsStore | settingsOrchestrator |
| Bonus: Reconnect | WebSocket manager | - | marketOrchestrator |

## 9. Data Flow

```
[REST API] --> [Orchestrator] --> [Action] --> [Mutator] --> [Store] --> [React]
                  |
[WebSocket] -----+
```

## 10. File Structure (Complete)

```
crypto-dashboard/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   ├── stores/
│   ├── actions/
│   ├── mutators/
│   ├── orchestrators/
│   ├── services/
│   ├── types/
│   ├── i18n/
│   └── hooks/
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── SPEC.md
```

## 11. Implementation Priority

1. **Phase 1:** Basic setup + Store/Action/Mutator/Orchestrator skeleton
2. **Phase 2:** Dashboard with mock data
3. **Phase 3:** Real WebSocket integration
4. **Phase 4:** Token detail + Chart
5. **Phase 5:** Settings + i18n
6. **Phase 6:** Bonus features