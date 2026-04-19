import type { OrderBookLevel } from '../features/market/marketSlice'

export type ZerodhaSubscription = {
  instrumentToken: number
  mode?: 'ltp' | 'quote' | 'full'
}

export type ZerodhaMarketTick = {
  instrumentToken: number
  lastPrice: number
  bid?: number
  ask?: number
  volume?: number
  changePercent?: number
  depth?: {
    bids: OrderBookLevel[]
    asks: OrderBookLevel[]
  }
}

type ZerodhaFeedCallbacks = {
  onOpen?: () => void
  onClose?: () => void
  onError?: (message: string) => void
  onStatus?: (status: 'connecting' | 'connected' | 'disconnected') => void
  onTicks: (ticks: ZerodhaMarketTick[]) => void
}

const PRICE_DIVISOR = 100
const DEPTH_ENTRY_SIZE = 12

export function connectZerodhaFeed({
  apiKey,
  accessToken,
  subscriptions,
  onOpen,
  onClose,
  onError,
  onStatus,
  onTicks,
}: {
  apiKey: string
  accessToken: string
  subscriptions: ZerodhaSubscription[]
} & ZerodhaFeedCallbacks) {
  onStatus?.('connecting')

  const ws = new WebSocket(`wss://ws.kite.trade?api_key=${encodeURIComponent(apiKey)}&access_token=${encodeURIComponent(accessToken)}`)
  ws.binaryType = 'arraybuffer'

  ws.addEventListener('open', () => {
    onStatus?.('connected')
    onOpen?.()

    const grouped = new Map<ZerodhaSubscription['mode'], number[]>()
    subscriptions.forEach((subscription) => {
      const mode = subscription.mode ?? 'full'
      const tokens = grouped.get(mode) ?? []
      tokens.push(subscription.instrumentToken)
      grouped.set(mode, tokens)
    })

    grouped.forEach((tokens, mode) => {
      ws.send(JSON.stringify({ a: 'subscribe', v: tokens }))
      ws.send(JSON.stringify({ a: 'mode', v: [mode, tokens] }))
    })
  })

  ws.addEventListener('message', (event) => {
    if (typeof event.data === 'string') {
      try {
        const payload = JSON.parse(event.data) as { type?: string; data?: string }
        if (payload.type === 'error' && payload.data) {
          onError?.(payload.data)
        }
      } catch {
        // Ignore non-JSON text frames.
      }
      return
    }

    const buffer = event.data as ArrayBuffer
    if (buffer.byteLength <= 1) {
      return
    }

    try {
      onTicks(parseZerodhaBinary(buffer))
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to parse Zerodha feed packet')
    }
  })

  ws.addEventListener('error', () => {
    onError?.('Zerodha WebSocket error')
  })

  ws.addEventListener('close', () => {
    onStatus?.('disconnected')
    onClose?.()
  })

  return {
    close() {
      ws.close()
    },
  }
}

function parseZerodhaBinary(buffer: ArrayBuffer): ZerodhaMarketTick[] {
  const view = new DataView(buffer)
  let offset = 0
  const packetCount = view.getUint16(offset)
  offset += 2
  const ticks: ZerodhaMarketTick[] = []

  for (let index = 0; index < packetCount; index += 1) {
    const packetLength = view.getUint16(offset)
    offset += 2
    const start = offset
    const instrumentToken = view.getUint32(start)
    const lastPrice = scalePrice(view.getInt32(start + 4))
    let volume: number | undefined
    let bid: number | undefined
    let ask: number | undefined
    let changePercent: number | undefined
    let depth: ZerodhaMarketTick['depth'] | undefined

    if (packetLength >= 40) {
      const open = scalePrice(view.getInt32(start + 28))
      const high = scalePrice(view.getInt32(start + 32))
      const low = scalePrice(view.getInt32(start + 36))
      const close = scalePrice(view.getInt32(start + 40))
      changePercent = close ? Number((((lastPrice - close) / close) * 100).toFixed(2)) : undefined
      void open
      void high
      void low
    }

    if (packetLength >= 64) {
      volume = view.getUint32(start + 16)
    }

    if (packetLength >= 184) {
      const bids: OrderBookLevel[] = []
      const asks: OrderBookLevel[] = []
      let depthOffset = start + 64

      for (let i = 0; i < 5; i += 1) {
        bids.push(readDepthLevel(view, depthOffset))
        depthOffset += DEPTH_ENTRY_SIZE
      }

      for (let i = 0; i < 5; i += 1) {
        asks.push(readDepthLevel(view, depthOffset))
        depthOffset += DEPTH_ENTRY_SIZE
      }

      depth = { bids, asks }
      bid = bids[0]?.price
      ask = asks[0]?.price
    }

    ticks.push({
      instrumentToken,
      lastPrice,
      bid,
      ask,
      volume,
      changePercent,
      depth,
    })

    offset += packetLength
  }

  return ticks
}

function readDepthLevel(view: DataView, offset: number): OrderBookLevel {
  const size = view.getUint32(offset)
  const price = scalePrice(view.getInt32(offset + 4))
  return { price, size }
}

function scalePrice(raw: number) {
  return Number((raw / PRICE_DIVISOR).toFixed(2))
}

