import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'stop-loss'
export type OrderStatus = 'pending' | 'executed' | 'failed' | 'cancelled'

export type Order = {
  id: string
  symbol: string
  side: OrderSide
  orderType: OrderType
  quantity: number
  price: number
  status: OrderStatus
  createdAt: string
}

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`

const initialState = {
  items: [
    {
      id: 'ord-1',
      symbol: 'AAPL',
      side: 'buy' as const,
      orderType: 'limit' as const,
      quantity: 18,
      price: 188.4,
      status: 'pending' as const,
      createdAt: '09:12',
    },
    {
      id: 'ord-2',
      symbol: 'BTC',
      side: 'sell' as const,
      orderType: 'market' as const,
      quantity: 0.08,
      price: 67_342,
      status: 'executed' as const,
      createdAt: '09:03',
    },
  ] as Order[],
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    placeOrder(state, action: PayloadAction<Omit<Order, 'id' | 'status' | 'createdAt'>>) {
      state.items.unshift({
        ...action.payload,
        id: createId(),
        status: 'pending',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    },
    updateOrderStatus(state, action: PayloadAction<{ id: string; status: OrderStatus }>) {
      const order = state.items.find((item) => item.id === action.payload.id)
      if (order) {
        order.status = action.payload.status
      }
    },
    cancelOrder(state, action: PayloadAction<string>) {
      const order = state.items.find((item) => item.id === action.payload)
      if (order) {
        order.status = 'cancelled'
      }
    },
  },
})

export const ordersReducer = ordersSlice.reducer
export const ordersActions = ordersSlice.actions

