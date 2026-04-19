import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Holding = {
  symbol: string
  name: string
  quantity: number
  avgCost: number
  lastPrice: number
}

const initialState = {
  cashBalance: 84_125,
  holdings: [
    { symbol: 'AAPL', name: 'Apple', quantity: 42, avgCost: 176.8, lastPrice: 189.62 },
    { symbol: 'TSLA', name: 'Tesla', quantity: 14, avgCost: 219.4, lastPrice: 211.87 },
    { symbol: 'BTC', name: 'Bitcoin', quantity: 0.6, avgCost: 62_100, lastPrice: 67_342 },
  ] as Holding[],
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    refreshPrices(state, action: PayloadAction<Record<string, number>>) {
      state.holdings.forEach((holding) => {
        const price = action.payload[holding.symbol]
        if (typeof price === 'number') {
          holding.lastPrice = price
        }
      })
    },
  },
})

export const portfolioReducer = portfolioSlice.reducer
export const portfolioActions = portfolioSlice.actions
