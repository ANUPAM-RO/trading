import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/store'
import { marketActions } from '../features/market/marketSlice'
import { watchlistActions } from '../features/watchlist/watchlistSlice'

function WatchlistPage() {
  const dispatch = useAppDispatch()
  const watchlist = useAppSelector((state) => state.watchlist.items)
  const symbols = useAppSelector((state) => state.market.symbols)
  const [value, setValue] = useState('')

  return (
    <section className="space-y-5">
      <header className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">Watchlist</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">Favorite assets</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          Add or remove symbols and jump straight into their market view.
        </p>
      </header>

      <section className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-[minmax(0,1fr)_auto]">
        <label className="grid gap-2 text-sm font-medium text-slate-200">
          Add symbol
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="BTC"
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <button
          type="button"
          className="self-end rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 font-medium text-slate-50 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-400/20"
          onClick={() => {
            dispatch(watchlistActions.addWatchlistItem(value))
            setValue('')
          }}
        >
          Add to watchlist
        </button>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="space-y-3">
          {watchlist.map((symbol) => {
            const market = symbols.find((item) => item.symbol === symbol)

            return (
              <div
                key={symbol}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <strong className="block text-slate-50">{symbol}</strong>
                  <span className="mt-1 block text-sm text-slate-400">{market?.name ?? 'Custom asset'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch(marketActions.selectSymbol(symbol))}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(watchlistActions.removeWatchlistItem(symbol))}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </section>
  )
}

export default WatchlistPage

