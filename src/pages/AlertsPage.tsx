import { useAppDispatch, useAppSelector } from '../app/store'
import { alertsActions } from '../features/alerts/alertsSlice'

function AlertsPage() {
  const dispatch = useAppDispatch()
  const alerts = useAppSelector((state) => state.alerts.items)

  return (
    <section className="space-y-5">
      <header className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
          Notifications & alerts
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">Execution updates</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          Price alerts, order status updates, and push-ready notification surfaces.
        </p>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col gap-3 rounded-2xl border bg-white/5 p-4 md:flex-row md:items-center md:justify-between ${
                alert.tone === 'success'
                  ? 'border-emerald-400/20'
                  : alert.tone === 'warning'
                    ? 'border-amber-300/20'
                    : alert.tone === 'critical'
                      ? 'border-rose-400/20'
                      : 'border-white/10'
              }`}
            >
              <div>
                <strong className="block text-slate-50">{alert.title}</strong>
                <span className="mt-1 block text-sm text-slate-400">{alert.message}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <em className="not-italic text-xs uppercase tracking-[0.2em] text-slate-400">
                  {alert.createdAt}
                </em>
                <button
                  type="button"
                  onClick={() => dispatch(alertsActions.dismissAlert(alert.id))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default AlertsPage

