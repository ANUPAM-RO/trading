import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  items: ['AAPL', 'TSLA', 'BTC', 'EURUSD'],
}

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    addWatchlistItem(state, action: PayloadAction<string>) {
      const symbol = action.payload.toUpperCase().trim()
      if (symbol && !state.items.includes(symbol)) {
        state.items.unshift(symbol)
      }
    },
    removeWatchlistItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item !== action.payload)
    },
  },
})

export const watchlistReducer = watchlistSlice.reducer
export const watchlistActions = watchlistSlice.actions

