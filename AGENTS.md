# AGENTS.md - Crypto Dashboard

## Project Status

**Empty scaffold** - No implementation yet. Run `yarn dev` to verify setup works.

## Tech Stack

- **React 19** + TypeScript + Vite
- **MobX/SatchelJS** - State management pattern (Store → Action → Mutator → Orchestrator)
- **TailwindCSS v4** - Uses CSS `@import` directives, no `tailwind.config.js`
- **i18next** - Localization (EN, VI)
- **Lightweight Charts** - TradingView candlestick charts
- **Binance API** - Public REST + WebSocket (no API key)

## Commands

```bash
yarn dev        # Start dev server
yarn build     # TypeScript + Vite build
```

## Architecture Pattern - SatchelJS

```
src/
├── stores/         # State interfaces
├── actions/       # Action creators  
├── mutators/       # Pure state transformers
├── orchestrators/ # Side effects (API, WebSocket)
├── services/      # API clients
└── components/    # React components
```

## Important Implementation Details

### TailwindCSS v4
Not configured via PostCSS. Use direct CSS:
```css
@import "tailwindcss";
```

### SatchelJS Flow
```
Action → Mutator → Store → React Observer
   ↑
Orchestrator (async: fetch API, WebSocket)
```

### Binance WebSocket
- Public endpoint: `wss://stream.binance.com:9443/ws/!miniTicker@arr`
- No API key required for public data

## Design System

Dark theme (from UX design spec):
- Primary: `#0C5CAB`
- Success: `#10b981` (price UP)
- Danger: `#ef4444` (price DOWN)
- Surface: `#09090B`
- Text: `#FAFAFA`

## Documents

| Document | Location |
|----------|----------|
| SPEC.md | Root - Architecture spec |
| PRD | `_bmad-output/planning-artifacts/prd.md` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |
| Epics | `_bmad-output/planning-artifacts/epics.md` |
| UX Spec | `_bmad-output/planning-artifacts/ux-design-specification.md` |

## First Implementation Priority

Per SPEC.md:
1. Basic setup + Store/Action/Mutator/Orchestrator skeleton
2. Dashboard with mock data
3. Real WebSocket integration
4. Token detail + Chart
5. Settings + i18n

## No Lint/Typecheck Config

No ESLint or strict typecheck configured. Build checks TypeScript.