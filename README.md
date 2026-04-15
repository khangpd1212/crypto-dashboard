# Crypto Dashboard

Real-time cryptocurrency price tracking dashboard using Binance public APIs.

## Prerequisites

- **Node.js** 18+ 
- **Yarn** (recommended) or npm

## Installation

```bash
# Install dependencies
yarn install
```

## Running the Project

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Tech Stack

- **React 19** + TypeScript + Vite
- **Mobx** - State management
- **TailwindCSS v4** - Styling
- **i18next** - Localization (EN, VI)
- **Lightweight Charts** - TradingView charts
- **Binance API** - Real-time price data (public, no API key required)

## Architecture

The project follows the **Mobx** pattern:

```
Action → Mutator → Store → React Observer
   ↑
Orchestrator (async: API, WebSocket)
```

### Directory Structure

| Directory | Purpose |
|-----------|---------|
| `stores/` | State interfaces |
| `actions/` | Action creators |
| `mutators/` | Pure state transformers |
| `orchestrators/` | Side effects (API, WebSocket) |
| `services/` | API clients |
| `components/` | React components |
| `features/` | Feature-specific modules |
| `i18n/` | Localization resources |

### Key Architectural Decisions

1. **Mobx over Redux/Context** - Unidirectional data flow with explicit action/mutator separation makes state changes predictable and testable. Orchestrators handle async operations cleanly.

2. **TailwindCSS v4** - Uses CSS `@import "tailwindcss"` directly without PostCSS configuration. Simpler setup, faster builds.

3. **Binance WebSocket for Real-Time Data** - Uses `wss://stream.binance.com:9443/ws/!miniTicker@arr` for live mini ticker updates. No API key needed for public data.

4. **Lightweight Charts** - TradingView's charting library provides performant candlestick charts with small bundle size.

5. **i18next for Localization** - Separates translations from code. Supports EN and VI locales.

## Design System

Dark theme with the following color tokens:

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0C5CAB` | Brand/accent |
| Success | `#10b981` | Price up |
| Danger | `#ef4444` | Price down |
| Surface | `#09090B` | Background |
| Text | `#FAFAFA` | Primary text |
