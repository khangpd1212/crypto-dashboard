import { setMarketErrorMutator, setMarketLoadingMutator } from "@/mutators/marketMutators";
import { fetchExchangeInfo } from "@/services/binanceApi";
import binanceWS from "@/services/binanceWebSocket";

export const initializeMarketData = async (): Promise<void> => {
  setMarketLoadingMutator(true);
  setMarketErrorMutator(null);
  
  try {
    const exchangeInfo = await fetchExchangeInfo();
    const usdtSymbols = exchangeInfo.symbols
      .filter(s => s.quoteAsset === 'USDT')
      .slice(0, 50)
      .map(s => s.symbol);
    
    binanceWS.connect(usdtSymbols);
  } catch (error) {
    setMarketErrorMutator(error instanceof Error ? error.message : 'Failed to fetch exchange info');
  } finally {
    setMarketLoadingMutator(false);
  }
};

export const disconnectMarketData = (): void => {
  binanceWS.disconnect();
};

export const reconnectMarketData = (): void => {
  binanceWS.reconnect();
};