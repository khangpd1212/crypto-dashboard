import type { MiniTicker } from "@/types/binance";
import {
  processMiniTickerMutator,
} from "@/mutators/marketMutators";

const WS_BASE = "wss://stream.binance.com:9443/stream";
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_RETRIES = 10;
const THROTTLE_MS = 100;

type MessageHandler = (data: any, stream: string) => void;

class BaseWebSocket {
  protected ws: WebSocket | null = null;
  protected reconnectAttempts = 0;
  protected reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  protected heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  protected isIntentionallyClosed = false;

  protected throttleBuffer: MiniTicker[] = [];
  protected throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  protected messageHandlers: Map<string, MessageHandler> = new Map();
  protected pendingStreams: string[] = [];
  protected activeStreams: string[] = [];

  protected get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  protected createConnection(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.ws = new WebSocket(WS_BASE);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;

      const streams =
        this.pendingStreams.length > 0
          ? this.pendingStreams
          : this.activeStreams.length > 0
            ? this.activeStreams
            : [...this.messageHandlers.keys()];

      if (streams.length > 0) {
        this.activeStreams = streams;
        this.sendSubscribe(streams);
      }

      this.pendingStreams = [];
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        this.handleMessage(JSON.parse(event.data));
      } catch (e) {
        console.error("WebSocket parse error:", e);
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.stopHeartbeat();

      if (!this.isIntentionallyClosed && this.reconnectAttempts < MAX_RETRIES) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (e) => {
      console.error("[WS] Error:", e);
    };
  }

  protected sendSubscribe(streams: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: streams,
        id: Date.now(),
      }),
    );
  }

  // protected sendUnsubscribe(streams: string[]): void {
  //   if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

  //   this.ws.send(
  //     JSON.stringify({
  //       method: "UNSUBSCRIBE",
  //       params: streams,
  //       id: Date.now(),
  //     }),
  //   );
  // }

  protected handleMessage(data: any): void {
    if (data.result !== undefined || data.id !== undefined) return;

    const stream = data.stream;
    const payload = data.data;

    if (stream && this.messageHandlers.has(stream)) {
      this.messageHandlers.get(stream)?.(payload, stream);
      return;
    }

    const tickers = data.stream ? data.data : data;
    const hasData = Array.isArray(tickers) ? tickers.length > 0 : !!tickers?.s;

    if (hasData) {
      this.queueUpdate(tickers);
    }
  }

  protected queueUpdate(tickers: MiniTicker[]): void {
    this.throttleBuffer = tickers;
    if (!this.throttleTimeout) {
      this.throttleTimeout = setTimeout(() => {
        processMiniTickerMutator(this.throttleBuffer);
        this.throttleBuffer = [];
        this.throttleTimeout = null;
      }, THROTTLE_MS);
    }
  }

  protected scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RETRIES) return;
    if (this.reconnectTimeout) return;

    const delay =
      RECONNECT_DELAYS[
        Math.min(this.reconnectAttempts, RECONNECT_DELAYS.length - 1)
      ];
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.reconnectAttempts < MAX_RETRIES) {
        this.createConnection();
      }
    }, delay);
  }

  protected startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 30000);
  }

  protected stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[WS] Already connected, skipping...");
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      console.log("[WS] Already connecting, skipping...");
      return;
    }

    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.createConnection();
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.reconnectAttempts = MAX_RETRIES;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.stopHeartbeat();
    if (this.throttleTimeout) clearTimeout(this.throttleTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // reconnect(): void {
  //   this.isIntentionallyClosed = false;
  //   this.reconnectAttempts = 0;
  //   this.createConnection();
  // }

  // addSubscriptions(streams: string[], handler: MessageHandler): void {
  //   streams.forEach((stream) => this.messageHandlers.set(stream, handler));

  //   const state = this.ws?.readyState;

  //   if (state === WebSocket.OPEN) {
  //     this.sendSubscribe(streams);
  //   } else if (state === WebSocket.CONNECTING || state === undefined) {
  //     if (!this.pendingStreams.includes(streams[0])) {
  //       this.pendingStreams = [...this.pendingStreams, ...streams];
  //     }
  //   } else if (
  //     !this.ws ||
  //     state === WebSocket.CLOSED ||
  //     state === WebSocket.CLOSING
  //   ) {
  //     this.createConnection();
  //   }
  // }

  // removeSubscriptions(streams: string[]): void {
  //   streams.forEach((stream) => this.messageHandlers.delete(stream));
  //   this.pendingStreams = this.pendingStreams.filter(
  //     (s) => !streams.includes(s),
  //   );

  //   if (this.ws?.readyState === WebSocket.OPEN) {
  //     this.sendUnsubscribe(streams);
  //   }
  // }
}

class MarketWebSocket extends BaseWebSocket {
  private static instance: MarketWebSocket | null = null;

  static getInstance(): MarketWebSocket {
    if (!MarketWebSocket.instance) {
      MarketWebSocket.instance = new MarketWebSocket();
    }
    return MarketWebSocket.instance;
  }

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.pendingStreams = ["!miniTicker@arr@3000ms"];
    this.activeStreams = [];
    this.createConnection();
  }
}

class TokenWebSocket extends BaseWebSocket {
  private static instance: TokenWebSocket | null = null;
  private currentSymbol: string = "";

  static getInstance(): TokenWebSocket {
    if (!TokenWebSocket.instance) {
      TokenWebSocket.instance = new TokenWebSocket();
    }
    return TokenWebSocket.instance;
  }

  connectToToken(symbol: string, handler: MessageHandler): void {
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.currentSymbol === symbol
    ) {
      console.log("[TokenWS] Already connected to", symbol);
      return;
    }

    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      this.ws = null;
    }

    const streams = [
      `${symbol.toLowerCase()}@miniTicker`,
      `${symbol.toLowerCase()}@depth20@100ms`,
      `${symbol.toLowerCase()}@trade`,
      `${symbol.toLowerCase()}@kline_15m`,
    ];

    this.currentSymbol = symbol;
    this.messageHandlers.clear();
    streams.forEach((stream) => this.messageHandlers.set(stream, handler));
    this.pendingStreams = streams;
    this.activeStreams = [];
    this.createConnection();
  }
}

export const marketWS = MarketWebSocket.getInstance();
export const tokenWS = TokenWebSocket.getInstance();
export { MarketWebSocket, TokenWebSocket };
