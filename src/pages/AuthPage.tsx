import { useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../app/store'
import { authActions } from '../features/auth/authSlice'

function AuthPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const [name, setName] = useState(auth.user.name)
  const [email, setEmail] = useState(auth.user.email)

  return (
    <section className="space-y-5">
      <header className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
            Authentication & security
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-50">Secure access</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            JWT/OAuth-ready structure, 2FA support, role control, and session tracking.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Status" value={auth.isAuthenticated ? 'Authenticated' : 'Signed out'} />
          <Stat label="Role" value={auth.user.role} />
          <Stat label="2FA" value={auth.twoFactorEnabled ? 'Enabled' : 'Disabled'} />
          <Stat label="Session" value={`${auth.sessionMinutesRemaining} min`} />
        </div>
      </header>

      <section className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-200">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-200">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <button
          type="button"
          className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 font-medium text-slate-50 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-400/20 md:col-span-2"
          onClick={() => dispatch(authActions.updateProfile({ name, email }))}
        >
          Save profile
        </button>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <ActionButton onClick={() => dispatch(authActions.loginDemo())}>Login demo</ActionButton>
          <ActionButton onClick={() => dispatch(authActions.logout())}>Logout</ActionButton>
          <ActionButton onClick={() => dispatch(authActions.toggleRole())}>Toggle role</ActionButton>
          <ActionButton onClick={() => dispatch(authActions.toggleTwoFactor())}>Toggle 2FA</ActionButton>
        </div>
      </section>
    </section>
  )
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10"
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

export default AuthPage
