import { setMarketErrorMutator, setMarketLoadingMutator, setTickersMutator } from "@/mutators/marketMutators";
import { fetchExchangeInfo, fetchTickers24hr } from "@/services/binanceApi";
import { marketWS } from "@/services/binanceWebSocket";

export const initializeMarketData = async (): Promise<void> => {
  setMarketLoadingMutator(true);
  setMarketErrorMutator(null);
  
  try {
    const [tickers, _exchangeInfo] = await Promise.all([
      fetchTickers24hr(),
      fetchExchangeInfo(),
    ]);
    
    setTickersMutator(tickers);
    marketWS.connect();
  } catch (error) {
    setMarketErrorMutator(error instanceof Error ? error.message : 'Failed to fetch data');
    marketWS.connect();
  }
};