import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/store'
import { formatCompact, formatCurrency } from '../lib/format'

const overviewCards = [
  { title: 'Authentication', to: '/auth', desc: 'JWT/OAuth, 2FA, and roles' },
  { title: 'Market data', to: '/market', desc: 'Live prices and depth' },
  { title: 'Orders', to: '/orders', desc: 'Market, limit, stop-loss' },
  { title: 'Portfolio', to: '/portfolio', desc: 'Holdings and P/L' },
  { title: 'Alerts', to: '/alerts', desc: 'Order and price notifications' },
  { title: 'Watchlist', to: '/watchlist', desc: 'Favorite assets' },
  { title: 'Analytics', to: '/analytics', desc: 'Performance insights' },
  { title: 'Settings', to: '/settings', desc: 'Theme, currency, language' },
]

function DashboardPage() {
  const currency = useAppSelector((state) => state.settings.currency)
  const symbols = useAppSelector((state) => state.market.symbols)
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol)
  const orders = useAppSelector((state) => state.orders.items)
  const holdings = useAppSelector((state) => state.portfolio.holdings)
  const cashBalance = useAppSelector((state) => state.portfolio.cashBalance)
  const alerts = useAppSelector((state) => state.alerts.items)

  const selected = symbols.find((symbol) => symbol.symbol === selectedSymbol) ?? symbols[0]
  const pnl = holdings.reduce((sum, holding) => sum + (holding.lastPrice - holding.avgCost) * holding.quantity, 0)
  const equity = cashBalance + holdings.reduce((sum, holding) => sum + holding.lastPrice * holding.quantity, 0)

  return (
    <section className="space-y-5">
      <header className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">Overview</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-50">Trading dashboard</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            The platform is now split into separate Redux-powered feature pages so auth, market
            data, execution, portfolio, alerts, and settings are easier to maintain.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Equity" value={formatCurrency(equity, currency)} />
          <Stat
            label="Daily P/L"
            value={`${pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(pnl), currency)}`}
            tone={pnl >= 0 ? 'up' : 'down'}
          />
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Alerts" value={String(alerts.length)} />
        </div>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
              Market snapshot
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              {selected.symbol} <span className="text-sm font-normal text-slate-400">{selected.name}</span>
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
            {selected.market}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Price" value={formatCurrency(selected.price, currency)} />
          <Stat
            label="Bid / Ask"
            value={`${formatCurrency(selected.bid, currency)} / ${formatCurrency(selected.ask, currency)}`}
          />
          <Stat label="Volume" value={formatCompact(selected.volume)} />
          <Stat
            label="Change"
            value={`${selected.change >= 0 ? '+' : ''}${selected.change.toFixed(2)}%`}
            tone={selected.change >= 0 ? 'up' : 'down'}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-inherit no-underline transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10"
          >
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
              Open
            </span>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-50">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{card.desc}</p>
          </Link>
        ))}
      </section>
    </section>
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
      <strong className={`mt-3 block text-lg font-semibold text-slate-50 ${tone === 'up' ? 'text-emerald-400' : ''} ${tone === 'down' ? 'text-rose-400' : ''}`}>
        {value}
      </strong>
    </div>
  )
}

export default DashboardPage

