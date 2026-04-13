import type { MiniTicker } from '@/types/binance';
import { processMiniTickerMutator, setMarketConnectedMutator } from '@/mutators/marketMutators';

const WS_BASE = 'wss://stream.binance.com:9443/ws';
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_RETRIES = 10;

class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isIntentionallyClosed = false;
  private throttleBuffer: MiniTicker[] = [];
  private throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly THROTTLE_MS = 100;

  connect(symbols?: string[]): void {
    this.isIntentionallyClosed = false;
    const streams = symbols 
      ? symbols.map(s => `${s.toLowerCase()}@miniTicker`).join('/')
      : '!miniTicker@arr';
    
    const url = `${WS_BASE}/${streams}`;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      setMarketConnectedMutator(true);
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };
    
    this.ws.onclose = () => {
      setMarketConnectedMutator(false);
      this.stopHeartbeat();
      
      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };
    
    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private handleMessage(data: any): void {
    if (Array.isArray(data)) {
      data.forEach((item: MiniTicker) => this.queueUpdate(item));
    } else if (data.s) {
      this.queueUpdate(data);
    }
  }

  private queueUpdate(ticker: MiniTicker): void {
    this.throttleBuffer.push(ticker);
    
    if (!this.throttleTimeout) {
      this.throttleTimeout = setTimeout(() => {
        this.throttleBuffer.forEach(processMiniTickerMutator);
        this.throttleBuffer = [];
        this.throttleTimeout = null;
      }, this.THROTTLE_MS);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RETRIES) {
      return;
    }
    
    const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempts, RECONNECT_DELAYS.length - 1)];
    this.reconnectAttempts++;
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
    
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  reconnect(symbols?: string[]): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect(symbols);
  }
}

export const binanceWS = new BinanceWebSocket();
export default binanceWS;