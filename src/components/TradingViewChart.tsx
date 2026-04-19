import { useEffect, useMemo, useRef } from 'react'

type TradingViewChartProps = {
  symbol: string
  theme?: 'dark' | 'light'
}

const symbolMap: Record<string, string> = {
  INFY: 'NSE:INFY',
  TATAMOTORS: 'NSE:TATAMOTORS',
  AAPL: 'NASDAQ:AAPL',
  BTC: 'BINANCE:BTCUSDT',
  EURUSD: 'FX:EURUSD',
}

function TradingViewChart({ symbol, theme = 'dark' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const tvSymbol = useMemo(() => symbolMap[symbol] ?? `NASDAQ:${symbol}`, [symbol])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    container.innerHTML = ''

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    widgetContainer.style.height = 'calc(100% - 32px)'
    widgetContainer.style.width = '100%'

    const copyright = document.createElement('div')
    copyright.className = 'tradingview-widget-copyright'
    copyright.innerHTML =
      `<a href="https://www.tradingview.com/symbols/${encodeURIComponent(tvSymbol)}/?utm_source=trading-app&utm_medium=widget&utm_campaign=advanced-chart" rel="noopener nofollow" target="_blank">` +
      `<span class="blue-text">${tvSymbol}</span></a><span class="trademark"> by TradingView</span>`

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'exchange',
      theme,
      style: '1',
      locale: 'en',
      hide_top_toolbar: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    })

    container.append(widgetContainer, copyright, script)

    return () => {
      container.innerHTML = ''
    }
  }, [theme, tvSymbol])

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} />
  )
}

export default TradingViewChart
