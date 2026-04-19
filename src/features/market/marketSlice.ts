import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type MarketSymbol = {
  symbol: string
  name: string
  market: 'stocks' | 'crypto' | 'forex'
  instrumentToken?: number
  price: number
  change: number
  bid: number
  ask: number
  volume: number
  history: number[]
}

export type OrderBookLevel = {
  price: number
  size: number
}

export type TickerItem = {
  symbol: string
  price: number
  change: number
  direction: 'up' | 'down'
}

const initialSymbols: MarketSymbol[] = [
  {
    symbol: 'INFY',
    name: 'Infosys',
    market: 'stocks',
    instrumentToken: 408065,
    price: 1523.2,
    change: 0.84,
    bid: 1523.1,
    ask: 1523.35,
    volume: 4_820_000,
    history: [1488, 1492.4, 1501.8, 1504.1, 1510.6, 1517.2, 1518.8, 1520.4, 1522.1, 1523.2],
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors',
    market: 'stocks',
    instrumentToken: 884737,
    price: 987.45,
    change: -0.48,
    bid: 987.35,
    ask: 987.6,
    volume: 9_120_000,
    history: [1002, 998.8, 995.4, 992.2, 990.5, 989.4, 988.2, 987.9, 987.6, 987.45],
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    market: 'stocks',
    price: 189.62,
    change: 1.24,
    bid: 189.58,
    ask: 189.67,
    volume: 8_420_000,
    history: [182, 183.2, 184.9, 184.3, 186.1, 187.8, 188.5, 189.4, 189.2, 189.62],
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    market: 'crypto',
    price: 67_342,
    change: 2.18,
    bid: 67_320,
    ask: 67_356,
    volume: 9_120,
    history: [65000, 65550, 66120, 65880, 66300, 66880, 67100, 67020, 67210, 67342],
  },
  {
    symbol: 'EURUSD',
    name: 'Euro / Dollar',
    market: 'forex',
    price: 1.0864,
    change: 0.14,
    bid: 1.0862,
    ask: 1.0865,
    volume: 1_820_000,
    history: [1.082, 1.0828, 1.0838, 1.0841, 1.085, 1.0855, 1.0859, 1.086, 1.0862, 1.0864],
  },
]

const createOrderBook = (price: number, isLarge = false) => {
  const magnitude = isLarge ? price * 0.0015 : price * 0.0008
  return {
    bids: Array.from({ length: 6 }, (_, index) => ({
      price: Number((price - (index + 1) * magnitude).toFixed(price > 10 ? 2 : 4)),
      size: Math.max(1, Math.round(120 - index * 14 + Math.random() * 18)),
    })),
    asks: Array.from({ length: 6 }, (_, index) => ({
      price: Number((price + (index + 1) * magnitude).toFixed(price > 10 ? 2 : 4)),
      size: Math.max(1, Math.round(110 - index * 12 + Math.random() * 16)),
    })),
  }
}

const createTicker = (symbols: MarketSymbol[]): TickerItem[] =>
  symbols.map((symbol) => ({
    symbol: symbol.symbol,
    price: symbol.price,
    change: symbol.change,
    direction: symbol.change >= 0 ? 'up' : 'down',
  }))

const initialBook = createOrderBook(initialSymbols[0].price, initialSymbols[0].price > 1000)

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    selectedSymbol: 'INFY',
    timeframe: '1D',
    symbols: initialSymbols,
    connectionStatus: 'connected' as 'connecting' | 'connected' | 'disconnected',
    feedSource: 'Mock WebSocket stream',
    lastUpdated: 'just now',
    orderBook: initialBook,
    ticker: createTicker(initialSymbols),
  },
  reducers: {
    selectSymbol(state, action: PayloadAction<string>) {
      state.selectedSymbol = action.payload
      const selected = state.symbols.find((item) => item.symbol === action.payload)
      if (selected) {
        state.orderBook = createOrderBook(selected.price, selected.price > 1000)
      }
    },
    setTimeframe(state, action: PayloadAction<string>) {
      state.timeframe = action.payload
    },
    tickMarket(state) {
      state.symbols.forEach((symbol) => {
        const swing =
          (Math.random() - 0.5) *
          (symbol.price > 1000 ? 140 : symbol.price > 10 ? 2.2 : 0.012)
        const nextPrice = Math.max(
          0.01,
          Number((symbol.price + swing).toFixed(symbol.price > 10 ? 2 : 4)),
        )
        symbol.price = nextPrice
        symbol.change = Number(
          (((nextPrice - symbol.history[0]) / symbol.history[0]) * 100).toFixed(2),
        )
        symbol.bid = Number((nextPrice - nextPrice * 0.0004).toFixed(symbol.price > 10 ? 2 : 4))
        symbol.ask = Number((nextPrice + nextPrice * 0.0004).toFixed(symbol.price > 10 ? 2 : 4))
        symbol.volume = Math.max(
          1_000,
          Math.round(symbol.volume + (Math.random() - 0.5) * symbol.volume * 0.03),
        )
        symbol.history = [...symbol.history.slice(-11), nextPrice]
      })

      const selected = state.symbols.find((item) => item.symbol === state.selectedSymbol)
      if (selected) {
        state.orderBook = createOrderBook(selected.price, selected.price > 1000)
      }

      state.ticker = createTicker(state.symbols)
      state.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    applyLiveTicks(
      state,
      action: PayloadAction<{
        ticks: Array<{
          instrumentToken: number
          lastPrice: number
          bid?: number
          ask?: number
          volume?: number
          changePercent?: number
          depth?: { bids: Array<{ price: number; size: number }>; asks: Array<{ price: number; size: number }> }
        }>
        source: string
      }>,
    ) {
      action.payload.ticks.forEach((tick) => {
        const symbol = state.symbols.find((item) => item.instrumentToken === tick.instrumentToken)
        if (!symbol) {
          return
        }

        symbol.price = tick.lastPrice
        symbol.bid = tick.bid ?? symbol.bid
        symbol.ask = tick.ask ?? symbol.ask
        symbol.change = tick.changePercent ?? symbol.change
        symbol.volume = tick.volume ?? symbol.volume
        symbol.history = [...symbol.history.slice(-11), tick.lastPrice]

        if (tick.depth) {
          state.orderBook = {
            bids: tick.depth.bids.slice(0, 5),
            asks: tick.depth.asks.slice(0, 5),
          }
        }
      })

      state.ticker = createTicker(state.symbols)
      state.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      state.feedSource = action.payload.source
    },
    setConnectionStatus(state, action: PayloadAction<'connecting' | 'connected' | 'disconnected'>) {
      state.connectionStatus = action.payload
    },
  },
})

export const marketReducer = marketSlice.reducer
export const marketActions = marketSlice.actions
export const marketInitialSymbols = initialSymbols
