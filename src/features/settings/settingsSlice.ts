import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Theme = 'dark' | 'light'
export type Currency = 'USD' | 'INR' | 'EUR'
export type Language = 'en' | 'hi' | 'es'

const initialState = {
  theme: 'dark' as Theme,
  currency: 'USD' as Currency,
  language: 'en' as Language,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    setCurrency(state, action: PayloadAction<Currency>) {
      state.currency = action.payload
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload
    },
  },
})

export const settingsReducer = settingsSlice.reducer
export const settingsActions = settingsSlice.actions

