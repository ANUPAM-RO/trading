import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

type Market3DChartProps = {
  symbol: string
  history: number[]
  theme?: 'dark' | 'light'
  change?: number
}

type Candle = {
  open: number
  high: number
  low: number
  close: number
}

function Market3DChart({ symbol, history, theme = 'dark', change = 0 }: Market3DChartProps) {
  const candles = useMemo(() => buildCandles(history), [history])
  const { min, max, normalizedCandles } = useMemo(() => {
    const prices = candles.flatMap((candle) => [candle.open, candle.high, candle.low, candle.close])
    const minValue = Math.min(...prices)
    const maxValue = Math.max(...prices)
    const range = Math.max(maxValue - minValue, maxValue * 0.02 || 1)

    return {
      min: minValue,
      max: maxValue,
      priceRange: range,
      normalizedCandles: candles.map((candle) => ({
        ...candle,
        open: (candle.open - minValue) / range,
        high: (candle.high - minValue) / range,
        low: (candle.low - minValue) / range,
        close: (candle.close - minValue) / range,
      })),
    }
  }, [candles])

  const accentColor = theme === 'dark' ? '#67e8f9' : '#0f766e'
  const bullishColor = '#34d399'
  const bearishColor = '#fb7185'

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-transparent">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-lg shadow-black/20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          3D candlestick chart
        </p>
        <p className="mt-1 text-sm text-slate-300">{symbol}</p>
        <p className="mt-1 text-xs text-slate-500">
          Height = price, depth = time, color = bullish / bearish
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Range {min.toFixed(2)} to {max.toFixed(2)}
        </p>
      </div>

      <Canvas
        camera={{ position: [0, 8, 15], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050b14']} />
        <fog attach="fog" args={['#050b14', 18, 40]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[8, 12, 10]} intensity={1.5} color={accentColor} />
        <directionalLight position={[-10, 8, -6]} intensity={0.7} color={change >= 0 ? bullishColor : bearishColor} />

        <group position={[0, -1.4, 0]}>
          <gridHelper args={[22, 22, '#1e293b', '#132033']} position={[0, -2.2, 0]} />
          <Candles candles={normalizedCandles} />
          <PriceBase />
          <TimeDepthGuide candles={normalizedCandles} />
        </group>

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={22}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  )
}

function Candles({ candles }: { candles: Candle[] }) {
  const spacing = 1.1
  const startZ = -((candles.length - 1) * spacing) / 2

  return (
    <group>
      {candles.map((candle, index) => {
        const bullish = candle.close >= candle.open
        const bodyTop = Math.max(candle.open, candle.close)
        const bodyBottom = Math.min(candle.open, candle.close)
        const bodyHeight = Math.max(0.06, bodyTop - bodyBottom)
        const wickHeight = Math.max(0.05, candle.high - candle.low)
        const z = startZ + index * spacing
        const bodyColor = bullish ? '#34d399' : '#fb7185'
        const wickColor = bullish ? '#86efac' : '#fda4af'

        return (
          <group key={`${index}-${candle.open}-${candle.close}`} position={[0, 0, z]}>
            <mesh position={[0, bodyBottom + bodyHeight / 2 - 2.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.82, bodyHeight * 5.8, 0.52]} />
              <meshStandardMaterial color={bodyColor} metalness={0.18} roughness={0.25} />
            </mesh>

            <mesh position={[0, (candle.low + wickHeight / 2) * 5.8 - 2.2, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, wickHeight * 5.8, 16]} />
              <meshStandardMaterial color={wickColor} emissive={bodyColor} emissiveIntensity={0.12} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function TimeDepthGuide({ candles }: { candles: Candle[] }) {
  const spacing = 1.1
  const startZ = -((candles.length - 1) * spacing) / 2

  return (
    <group position={[0, -2.25, 0]}>
      {candles.map((_, index) => (
        <mesh key={index} position={[0, 0, startZ + index * spacing]}>
          <boxGeometry args={[0.02, 0.02, 0.9]} />
          <meshStandardMaterial color="#1d4ed8" emissive="#0f172a" emissiveIntensity={0.2} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.2, 6.28, 64]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

function PriceBase() {
  return (
    <group position={[0, -2.3, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color="#08111f" metalness={0.05} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[8.35, 0.02, 12, 64]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#0f172a" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

function buildCandles(history: number[]): Candle[] {
  if (history.length < 2) {
    const value = history[0] ?? 0
    return [
      {
        open: value,
        high: value * 1.01,
        low: value * 0.99,
        close: value,
      },
    ]
  }

  const candles: Candle[] = []

  for (let index = 1; index < history.length; index += 1) {
    const open = history[index - 1]
    const close = history[index]
    const swing = Math.max(Math.abs(close - open) * 0.45, Math.max(open, close) * 0.006)
    const high = Math.max(open, close) + swing
    const low = Math.max(0.01, Math.min(open, close) - swing)

    candles.push({ open, high, low, close })
  }

  return candles
}

export default Market3DChart
