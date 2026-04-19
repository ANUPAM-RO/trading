import { useAppSelector } from '../app/store'
import { formatCurrency } from '../lib/format'

function PortfolioPage() {
  const currency = useAppSelector((state) => state.settings.currency)
  const holdings = useAppSelector((state) => state.portfolio.holdings)
  const cashBalance = useAppSelector((state) => state.portfolio.cashBalance)

  const invested = holdings.reduce((sum, holding) => sum + holding.quantity * holding.lastPrice, 0)
  const pnl = holdings.reduce((sum, holding) => sum + (holding.lastPrice - holding.avgCost) * holding.quantity, 0)

  return (
    <section className="space-y-5">
      <header className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
            Portfolio management
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-50">Holdings overview</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Track assets, cash, allocation, and profit or loss from one dedicated page.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Cash" value={formatCurrency(cashBalance, currency)} />
          <Stat label="Invested" value={formatCurrency(invested, currency)} />
          <Stat
            label="P/L"
            value={`${pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(pnl), currency)}`}
            tone={pnl >= 0 ? 'up' : 'down'}
          />
          <Stat label="Assets" value={String(holdings.length)} />
        </div>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="space-y-3">
          {holdings.map((holding) => {
            const gain = (holding.lastPrice - holding.avgCost) * holding.quantity

            return (
              <div
                key={holding.symbol}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <strong className="block text-slate-50">{holding.symbol}</strong>
                  <span className="mt-1 block text-sm text-slate-400">
                    {holding.name} | {holding.quantity} units @ {formatCurrency(holding.avgCost, currency)}
                  </span>
                </div>
                <div className="text-left md:text-right">
                  <strong className="block text-slate-50">
                    {formatCurrency(holding.quantity * holding.lastPrice, currency)}
                  </strong>
                  <span className={gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {gain >= 0 ? '+' : ''}
                    {formatCurrency(Math.abs(gain), currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
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
      <strong
        className={`mt-3 block text-lg font-semibold text-slate-50 ${tone === 'up' ? 'text-emerald-400' : ''} ${tone === 'down' ? 'text-rose-400' : ''}`}
      >
        {value}
      </strong>
    </div>
  )
}

export default PortfolioPage

