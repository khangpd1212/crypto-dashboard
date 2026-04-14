# Frontend Developer Technical

# Assessment: Crypto Market Dashboard

## Overview

Thank you for your interest in joining our engineering team! This assessment is designed to
evaluate your proficiency in building modern, real-time web applications. You will be building
a **Crypto Market Dashboard** that displays real-time cryptocurrency data.
We are looking for clean architecture, proper state management, strict typing, and efficient
handling of real-time data streams.

## Target Level

**Junior to Mid-Level**

## Required Tech Stack

```
● Language: TypeScript
● Framework: React (Functional components, Hooks)
● State Management: MobX & SatchelJS (Strict adherence to Store, Action, Mutator,
and Orchestrator patterns)
● Real-time Data: Native WebSocket API
● Styling: Any modern CSS solution (TailwindCSS, Styled Components, SCSS, etc.)
```

## Core Requirements (User Stories)

### 1. Real-time Market Dashboard

```
● As a user , I want to see a list/grid of cryptocurrency pairs (e.g., BTC/USDT,
ETH/USDT, BNB/USDT) on the home page.
● Functionality: * Fetch the initial list of pairs using the Binance REST API.
○ Connect to the Binance WebSocket API to receive real-time price updates.
○ Display the Symbol, Current Price, and 24h Price Change (%).
○ Visual cue: Briefly highlight rows/cards in green when the price goes up, and
red when the price goes down.
```

### 2. Token Details & Charting

```
● As a user , I want to search for a specific token and view its price chart.
● Functionality:
```

```
○ Implement a search bar with auto-suggest/filtering for available trading pairs.
○ When a token is selected, navigate to (or open) a detail view.
○ Render a Candlestick (K-line) chart for the selected token. You may use
charting libraries like Lightweight Charts (TradingView), Recharts, or
Chart.js.
○ Load historical data via REST API and keep the current candle updated via
WebSocket.
```

### 3. User Settings & Localization

```
● As a user , I want to be able to change the language of my dashboard.
● Functionality:
○ Localization: Ability to switch between at least two languages (e.g., English
and one other) for the main UI elements.
```

## Bonus Features (To showcase Mid-Level skills)

_If you finish the core requirements and want to stand out, implement one or more of the
following using the free Binance API:_

1. **Real-time Order Book (Depth):** Display a real-time order book (bids and asks) for
   the selected token. _Tests your ability to handle high-frequency WebSocket updates_
   _and React rendering performance._
2. **Favorites / Watchlist:** Allow users to "star" or favorite specific trading pairs on the
   dashboard, keeping them pinned to the top.
3. **Recent Trades Feed:** A scrolling, real-time list of the most recent market trades for
   the selected token.
4. **Responsive Design:** Ensure the dashboard and charts are fully optimized for mobile
   devices.
5. **Resilient Connections (WebSocket Reconnect):** Implement auto-reconnect logic
   with exponential backoff for the WebSocket stream in case of network drops or
   server disconnects.
6. **Robust UX (Error Handling & Loading States):** Display thoughtful loading states
   (e.g., skeleton screens or spinners) during initial data fetching, and implement
   comprehensive error handling (e.g., toast notifications, error boundaries) for API or
   network failures.
7. **Advanced User Settings & Persistence:**
   ○ **Theme Toggle:** Ability to switch between Light and Dark mode.
   ○ **User Avatar:** A simple UI to upload/set a profile avatar (saved locally).
   ○ **State Persistence:** All settings (language, theme, avatar) must be persisted
   across browser reloads using localStorage, integrated properly into the
   SatchelJS state.

## Architectural Guidelines & Hints

### SatchelJS Implementation

We expect to see a clear separation of concerns using the SatchelJS pattern:
● **Store:** Define your state interface and initialize the store.
● **Actions:** Define what happened (e.g., updatePrice(symbol, price)).
● **Mutators:** Pure functions that change the store based on actions.
● **Orchestrators:** Side effects (e.g., fetching initial REST data, opening WebSocket
connections, and then dispatching actions).

### Binance API Reference

You will be using the public, free Binance APIs (No API Key required for these endpoints):
● **REST Base:** https://api.binance.com/api/v
○ _Exchange Info:_ /exchangeInfo (To get available pairs)
○ _Historical Klines:_ /klines?symbol=BTCUSDT&interval=15m
● **WebSocket Base:** wss://stream.binance.com:9443/ws
○ _All Market Mini Tickers (Dashboard):_ !miniTicker@arr
○ _Individual Kline/Candle (Chart):_ <symbol>@kline*<interval> (e.g.,
btcusdt@kline_15m)
○ \_Order Book Depth (Bonus):* <symbol>@depth20@100ms
_Api Change Logs:
https://developers.binance.com/docs/binance-spot-api-docs_

### Performance Considerations

WebSockets can emit multiple messages per second. Please consider how you update your
React components and MobX/SatchelJS state to avoid unnecessary re-renders and browser
lagging.

## Evaluation Criteria

Your submission will be evaluated based on:

1. **Architecture:** Proper use of MobX and SatchelJS (Flux pattern).
2. **TypeScript Mastery:** Strict typing for state, API responses, props, and WebSocket
   payloads. Avoid using any.
3. **Performance:** Efficient handling of the WebSocket stream. (e.g., throttling updates,
   using React.memo, or targeted MobX observer updates).
4. **Code Quality:** Clean, readable, modular, and well-organized code.
5. **UI/UX:** A clean, intuitive, and relatively polished interface.

## Submission

1. Initialize a public Git repository (GitHub/GitLab).

2. Commit your progress logically so we can see your development process. **You must**
   **follow the Conventional Commits specification for your commit messages**
   (e.g., feat: add market dashboard, fix: resolve websocket memory
   leak, chore: update dependencies).
3. Include a README.md with instructions on how to install and run the project, and a
   brief explanation of any major architectural decisions you made.
4. Share the repository link with us when you are finished.
   Good luck, and have fun building!
