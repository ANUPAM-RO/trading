import { useMemo, useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../app/store'
import { marketActions } from '../features/market/marketSlice'
import TradingViewChart from '../components/TradingViewChart'
import { formatCompact, formatCurrency } from '../lib/format'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

const timeframes = ['1m', '5m', '15m', '1H', '1D'] as const

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
)

function MarketPage() {
  const dispatch = useAppDispatch()
  const { symbols, selectedSymbol, timeframe, orderBook, ticker, connectionStatus, feedSource, lastUpdated } =
    useAppSelector((state) => state.market)
  const currency = useAppSelector((state) => state.settings.currency)
  const theme = useAppSelector((state) => state.settings.theme)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'tradingview'>('tradingview')

  const selected = useMemo(
    () => symbols.find((item) => item.symbol === selectedSymbol) ?? symbols[0],
    [selectedSymbol, symbols],
  )

  const chartData = useMemo<ChartData<'line'>>(
    () => ({
      labels: selected.history.map((_, index) => `P${index + 1}`),
      datasets: [
        {
          label: `${selected.symbol} price`,
          data: selected.history,
          borderColor: '#67e8f9',
          backgroundColor: 'rgba(103, 232, 249, 0.18)',
          pointBackgroundColor: '#67e8f9',
          pointBorderColor: '#67e8f9',
          fill: true,
          borderWidth: 2.5,
        },
      ],
    }),
    [selected.history, selected.symbol],
  )

  const lineOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(8, 15, 28, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(103, 232, 249, 0.35)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#94a3b8',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
        y: {
          ticks: {
            color: '#94a3b8',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
      },
    }),
    [],
  )

  const barOptions = useMemo<ChartOptions<'bar'>>(
    () => lineOptions as unknown as ChartOptions<'bar'>,
    [lineOptions],
  )

  const maxDepth = Math.max(
    ...orderBook.bids.map((item) => item.size),
    ...orderBook.asks.map((item) => item.size),
  )

  return (
    <section className="space-y-5">
      <header className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
            Real-time market data
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-50">Live prices and depth</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Mock WebSocket stream ready for Binance, Zerodha, or any live feed provider.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <StatusPill label={connectionStatus} />
            <StatusPill label={feedSource} />
            <StatusPill label={`Updated ${lastUpdated}`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Selected" value={selected.symbol} />
          <Stat label="Timeframe" value={timeframe} />
          <Stat label="Volume" value={formatCompact(selected.volume)} />
          <Stat
            label="Change"
            value={`${selected.change >= 0 ? '+' : ''}${selected.change.toFixed(2)}%`}
            tone={selected.change >= 0 ? 'up' : 'down'}
          />
        </div>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {symbols.map((symbol) => (
              <Chip
                key={symbol.symbol}
                active={symbol.symbol === selectedSymbol}
                onClick={() => dispatch(marketActions.selectSymbol(symbol.symbol))}
              >
                {symbol.symbol}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {timeframes.map((item) => (
              <Chip
                key={item}
                active={item === timeframe}
                onClick={() => dispatch(marketActions.setTimeframe(item))}
              >
                {item}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={chartType === 'tradingview'} onClick={() => setChartType('tradingview')}>
              TradingView
            </Chip>
            <Chip active={chartType === 'line'} onClick={() => setChartType('line')}>
              Line
            </Chip>
            <Chip active={chartType === 'bar'} onClick={() => setChartType('bar')}>
              Bar
            </Chip>
          </div>
        </div>

        <div className="h-[min(56vw,520px)] w-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          {chartType === 'tradingview' ? (
            <TradingViewChart symbol={selected.symbol} theme={theme} />
          ) : chartType === 'line' ? (
            <Line data={chartData} options={lineOptions} />
          ) : (
            <Bar data={chartData as unknown as ChartData<'bar'>} options={barOptions} />
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Price" value={formatCurrency(selected.price, currency)} />
          <Stat label="Bid" value={formatCurrency(selected.bid, currency)} />
          <Stat label="Ask" value={formatCurrency(selected.ask, currency)} />
          <Stat label="Market" value={selected.market} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
                Price ticker
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
                Live tape for all symbols
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
              scrolling feed
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {ticker.map((item) => (
              <div
                key={item.symbol}
                className="min-w-[180px] rounded-[22px] border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.symbol}</p>
                <strong className="mt-2 block text-lg text-slate-50">
                  {formatCurrency(item.price, currency)}
                </strong>
                <span className={item.direction === 'up' ? 'mt-2 block text-emerald-400' : 'mt-2 block text-rose-400'}>
                  {item.change >= 0 ? '+' : ''}
                  {item.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
            Order book
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
            Bid / ask depth
          </h3>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span>Bids</span>
              <span className="text-right">Asks</span>
            </div>
            {orderBook.bids.map((bid, index) => {
              const ask = orderBook.asks[index]
              return (
                <div key={`${bid.price}-${ask.price}`} className="grid grid-cols-2 gap-3">
              <DepthRow level={bid} maxDepth={maxDepth} side="bid" currency={currency} />
              <DepthRow level={ask} maxDepth={maxDepth} side="ask" align="right" currency={currency} />
            </div>
          )
            })}
          </div>

          <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Mid price</p>
            <strong className="mt-2 block text-2xl text-slate-50">
              {formatCurrency((selected.bid + selected.ask) / 2, currency)}
            </strong>
          </div>
        </div>
      </section>
    </section>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm transition hover:-translate-y-0.5 ${
        active
          ? 'border-cyan-300/40 bg-cyan-400/15 text-slate-50'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'up' | 'down'
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <span className="block text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <strong
        className={`mt-3 block text-lg font-semibold text-slate-50 ${
          tone === 'up' ? 'text-emerald-400' : tone === 'down' ? 'text-rose-400' : ''
        }`}
      >
        {value}
      </strong>
    </div>
  )
}

function DepthRow({
  level,
  maxDepth,
  side,
  align = 'left',
  currency,
}: {
  level: { price: number; size: number }
  maxDepth: number
  side: 'bid' | 'ask'
  align?: 'left' | 'right'
  currency: string
}) {
  const width = Math.max(10, (level.size / maxDepth) * 100)
  const barClass = side === 'bid' ? 'from-emerald-400/50 to-emerald-400/10' : 'from-rose-400/50 to-rose-400/10'

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-3 ${align === 'right' ? 'text-right' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-100">{formatCompact(level.size)}</span>
          <span className="text-sm text-slate-400">{formatCurrency(level.price, currency)}</span>
        </div>
      <div className="mt-2 h-2 rounded-full bg-slate-900/80">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${align === 'right' ? 'ml-auto' : ''} ${barClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
      {label}
    </span>
  )
}

export default MarketPage
