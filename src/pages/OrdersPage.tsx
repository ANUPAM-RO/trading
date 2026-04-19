import { useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector, store } from '../app/store'
import { alertsActions } from '../features/alerts/alertsSlice'
import { marketActions } from '../features/market/marketSlice'
import { ordersActions, type OrderSide, type OrderType } from '../features/orders/ordersSlice'
import { formatCurrency } from '../lib/format'

const orderTypes: OrderType[] = ['market', 'limit', 'stop-loss']

function OrdersPage() {
  const dispatch = useAppDispatch()
  const currency = useAppSelector((state) => state.settings.currency)
  const market = useAppSelector((state) => state.market)
  const orders = useAppSelector((state) => state.orders.items)
  const [side, setSide] = useState<OrderSide>('buy')
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [quantity, setQuantity] = useState(10)
  const [price, setPrice] = useState(market.symbols[0].price)

  const selected = market.symbols.find((item) => item.symbol === market.selectedSymbol) ?? market.symbols[0]

  const submitOrder = () => {
    const resolvedPrice = orderType === 'market' ? selected.price : price

    dispatch(
      ordersActions.placeOrder({
        symbol: selected.symbol,
        side,
        orderType,
        quantity,
        price: resolvedPrice,
      }),
    )
    dispatch(
      alertsActions.pushAlert({
        title: 'Order staged',
        message: `${side.toUpperCase()} ${selected.symbol} ${orderType} order submitted.`,
        tone: 'info',
      }),
    )

    if (orderType === 'market') {
      const latest = store.getState().orders.items[0]
      if (latest) {
        dispatch(ordersActions.updateOrderStatus({ id: latest.id, status: 'executed' }))
      }
    }
  }

  return (
    <section className="space-y-5">
      <header className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
            Buy / sell orders
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-50">Execution workflow</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Market, limit, and stop-loss order entry with live validation-ready state.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Selected symbol" value={selected.symbol} />
          <Stat label="Current price" value={formatCurrency(selected.price, currency)} />
          <Stat label="Pending" value={String(orders.filter((order) => order.status === 'pending').length)} />
          <Stat
            label="Executed"
            value={String(orders.filter((order) => order.status === 'executed').length)}
          />
        </div>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {market.symbols.map((symbol) => (
            <Chip
              key={symbol.symbol}
              active={symbol.symbol === selected.symbol}
              onClick={() => dispatch(marketActions.selectSymbol(symbol.symbol))}
            >
              {symbol.symbol}
            </Chip>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-200 md:col-span-2">
            Side
            <div className="flex flex-wrap gap-2">
              <Chip active={side === 'buy'} onClick={() => setSide('buy')}>
                Buy
              </Chip>
              <Chip active={side === 'sell'} onClick={() => setSide('sell')}>
                Sell
              </Chip>
            </div>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Order type
            <select
              value={orderType}
              onChange={(event) => setOrderType(event.target.value as OrderType)}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
            >
              {orderTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Quantity
            <input
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Price
            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>

          <button
            type="button"
            className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 font-medium text-slate-50 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-400/20 md:col-span-2"
            onClick={submitOrder}
          >
            Submit order
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
              Execution log
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">Order status</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
            {orders.length} total
          </span>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <strong className="block text-slate-50">
                  {order.side.toUpperCase()} {order.symbol}
                </strong>
                <span className="mt-1 block text-sm text-slate-400">
                  {order.orderType} | {order.quantity} units | {formatCurrency(order.price, currency)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={order.status} />
                {order.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => dispatch(ordersActions.cancelOrder(order.id))}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <span className="block text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <strong className="mt-3 block text-lg font-semibold text-slate-50">{value}</strong>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'executed'
      ? 'text-emerald-400'
      : status === 'pending'
        ? 'text-cyan-300'
        : 'text-rose-400'

  return (
    <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm capitalize ${tone}`}>
      {status}
    </span>
  )
}

export default OrdersPage
