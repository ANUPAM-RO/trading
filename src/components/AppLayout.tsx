import { NavLink, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/store'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/auth', label: 'Auth' },
  { to: '/market', label: 'Market' },
  { to: '/orders', label: 'Orders' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
]

const navClass =
  'flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-slate-50'

function AppLayout() {
  const user = useAppSelector((state) => state.auth.user)
  const theme = useAppSelector((state) => state.settings.theme)
  const symbols = useAppSelector((state) => state.market.symbols)
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol)
  const selected = symbols.find((item) => item.symbol === selectedSymbol) ?? symbols[0]
  const orders = useAppSelector((state) => state.orders.items)
  const alerts = useAppSelector((state) => state.alerts.items)
  const holdings = useAppSelector((state) => state.portfolio.holdings)
  const pnl = holdings.reduce(
    (sum, holding) => sum + (holding.lastPrice - holding.avgCost) * holding.quantity,
    0,
  )

  return (
    <div className="grid min-h-dvh lg:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="border-b border-white/10 bg-slate-950/90 px-5 py-6 backdrop-blur lg:sticky lg:top-0 lg:flex lg:min-h-dvh lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex-1">
          <div className="rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 via-white/5 to-transparent p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                  Northstar Desk
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
                  Trading platform
                </h1>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                {theme}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Focused modules, fast routing, and a trading-first command center layout.
            </p>
          </div>
        
          <nav className="mt-6 grid gap-2 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${navClass} ${isActive ? 'border-cyan-300/40 bg-cyan-400/10 text-slate-50' : ''}`
                }
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-500">→</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-6 grid gap-3">
          <InfoCard label="Role" value={user.role.toUpperCase()} />
          <InfoCard label="Market" value={selected.symbol} />
          <InfoCard label="Alerts" value={`${alerts.length} active`} />
        </div>
      </aside>

      <main className="min-h-0 p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/60 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                  Workspace
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
                  Command center
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {user.role}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {selected.symbol}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {alerts.length} alerts
                </span>
              </div>
            </div>
          </div>

          <Outlet />
        </div>
      </main>

      <aside className="border-t border-white/10 bg-slate-950/80 px-5 py-6 backdrop-blur lg:sticky lg:top-0 lg:flex lg:min-h-dvh lg:flex-col lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-5">
        <div className="flex-1">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Market pulse
            </p>
            <div className="mt-4 space-y-4">
              <PulseStat
                label="Open orders"
                value={String(orders.filter((order) => order.status === 'pending').length)}
              />
              <PulseStat label="Daily P/L" value={formatSigned(pnl)} tone={pnl >= 0 ? 'up' : 'down'} />
              <PulseStat label="Selected" value={selected.symbol} />
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Quick facts
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>{selected.market} market active</p>
              <p>{holdings.length} holdings tracked</p>
              <p>{alerts.length} alerts in feed</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
    </div>
  )
}

function PulseStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'up' | 'down'
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p
        className={`mt-2 text-lg font-semibold ${
          tone === 'up' ? 'text-emerald-400' : tone === 'down' ? 'text-rose-400' : 'text-slate-50'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

export default AppLayout
