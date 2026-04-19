import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { authReducer } from '../features/auth/authSlice'
import { alertsReducer } from '../features/alerts/alertsSlice'
import { marketReducer } from '../features/market/marketSlice'
import { ordersReducer } from '../features/orders/ordersSlice'
import { portfolioReducer } from '../features/portfolio/portfolioSlice'
import { settingsReducer } from '../features/settings/settingsSlice'
import { watchlistReducer } from '../features/watchlist/watchlistSlice'

export const store = configureStore({
  reducer: {
    market: marketReducer,
    auth: authReducer,
    orders: ordersReducer,
    alerts: alertsReducer,
    watchlist: watchlistReducer,
    settings: settingsReducer,
    portfolio: portfolioReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

