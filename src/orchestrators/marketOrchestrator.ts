import { setMarketErrorMutator, setMarketLoadingMutator, setHasReceivedDataMutator } from "@/mutators/marketMutators";
import { fetchExchangeInfo } from "@/services/binanceApi";
import { marketWS } from "@/services/binanceWebSocket";

export const initializeMarketData = async (): Promise<void> => {
  setHasReceivedDataMutator(false);
  setMarketLoadingMutator(true);
  setMarketErrorMutator(null);
  
  try {
    await fetchExchangeInfo();
    marketWS.connect();
  } catch (error) {
    setMarketErrorMutator(error instanceof Error ? error.message : 'Failed to fetch exchange info');
  } finally {
    setMarketLoadingMutator(false);
  }
};

export const disconnectMarketData = (): void => {
  marketWS.disconnect();
};

export const reconnectMarketData = (): void => {
  marketWS.reconnect();
};