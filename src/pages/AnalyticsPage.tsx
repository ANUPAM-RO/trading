import { useAppSelector } from '../app/store'
import { formatCurrency } from '../lib/format'

function AnalyticsPage() {
  const currency = useAppSelector((state) => state.settings.currency)
  const holdings = useAppSelector((state) => state.portfolio.holdings)
  const orders = useAppSelector((state) => state.orders.items)

  const wins = holdings.filter((holding) => holding.lastPrice >= holding.avgCost).length
  const successRate = orders.length
    ? Math.round((orders.filter((order) => order.status === 'executed').length / orders.length) * 100)
    : 0

  return (
    <section className="space-y-5">
      <header className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
          Dashboard & analytics
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">Performance insights</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          Daily P/L, trade statistics, and monitoring-style reporting.
        </p>
      </header>

      <section className="grid gap-3 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Winning holdings" value={String(wins)} />
        <Stat label="Order success" value={`${successRate}%`} />
        <Stat label="Total trades" value={String(orders.length)} />
        <Stat
          label="Avg position value"
          value={formatCurrency(
            holdings.reduce((sum, item) => sum + item.quantity * item.lastPrice, 0) / holdings.length,
            currency,
          )}
        />
      </section>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <span className="block text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <strong className="mt-3 block text-lg font-semibold text-slate-50">{value}</strong>
    </div>
  )
}

export default AnalyticsPage

