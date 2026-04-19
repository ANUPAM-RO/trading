import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { store, useAppDispatch, useAppSelector } from './app/store'
import { authActions } from './features/auth/authSlice'
import { marketActions } from './features/market/marketSlice'
import { portfolioActions } from './features/portfolio/portfolioSlice'
import { connectZerodhaFeed } from './services/zerodha'
import AlertsPage from './pages/AlertsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import MarketPage from './pages/MarketPage'
import OrdersPage from './pages/OrdersPage'
import PortfolioPage from './pages/PortfolioPage'
import SettingsPage from './pages/SettingsPage'
import WatchlistPage from './pages/WatchlistPage'

function App() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.settings.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const apiKey = import.meta.env.VITE_ZERODHA_API_KEY as string | undefined
    const accessToken = import.meta.env.VITE_ZERODHA_ACCESS_TOKEN as string | undefined
    const liveSubscriptions = store
      .getState()
      .market.symbols.filter((symbol) => typeof symbol.instrumentToken === 'number')
      .map((symbol) => ({
        instrumentToken: symbol.instrumentToken as number,
        mode: 'full' as const,
      }))

    if (apiKey && accessToken && liveSubscriptions.length > 0) {
      const feed = connectZerodhaFeed({
        apiKey,
        accessToken,
        subscriptions: liveSubscriptions,
        onStatus: (status) => {
          dispatch(marketActions.setConnectionStatus(status))
        },
        onTicks: (ticks) => {
          dispatch(
            marketActions.applyLiveTicks({
              ticks,
              source: 'Zerodha Kite WebSocket',
            }),
          )
          dispatch(
            portfolioActions.refreshPrices(
              Object.fromEntries(
                store.getState().market.symbols.map((symbol) => [symbol.symbol, symbol.price]),
              ),
            ),
          )
        },
        onError: () => {
          dispatch(marketActions.setConnectionStatus('disconnected'))
        },
      })

      return () => {
        feed.close()
        dispatch(marketActions.setConnectionStatus('disconnected'))
      }
    }

    dispatch(marketActions.setConnectionStatus('connecting'))
    const readyTimer = window.setTimeout(() => {
      dispatch(marketActions.setConnectionStatus('connected'))
    }, 350)

    const timer = window.setInterval(() => {
      dispatch(marketActions.tickMarket())
      dispatch(authActions.tickSession())
      dispatch(
        portfolioActions.refreshPrices(
          Object.fromEntries(
            store.getState().market.symbols.map((symbol) => [symbol.symbol, symbol.price]),
          ),
        ),
      )
    }, 2200)

    return () => {
      window.clearTimeout(readyTimer)
      window.clearInterval(timer)
      dispatch(marketActions.setConnectionStatus('disconnected'))
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
