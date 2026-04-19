import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AlertTone = 'info' | 'success' | 'warning' | 'critical'

export type Alert = {
  id: string
  title: string
  message: string
  tone: AlertTone
  createdAt: string
}

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`

const initialState = {
  items: [
    {
      id: 'alert-1',
      title: 'Session active',
      message: '2FA is enabled and the trading session is secure.',
      tone: 'success' as const,
      createdAt: '2 min ago',
    },
    {
      id: 'alert-2',
      title: 'Market depth refreshed',
      message: 'Bid and ask levels are updating in real time.',
      tone: 'info' as const,
      createdAt: '5 min ago',
    },
  ] as Alert[],
}

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    pushAlert(state, action: PayloadAction<Omit<Alert, 'id' | 'createdAt'>>) {
      state.items.unshift({
        ...action.payload,
        id: createId(),
        createdAt: 'just now',
      })
    },
    dismissAlert(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})

export const alertsReducer = alertsSlice.reducer
export const alertsActions = alertsSlice.actions

