import type { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../app/store'
import { authActions } from '../features/auth/authSlice'
import { settingsActions } from '../features/settings/settingsSlice'

function SettingsPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const auth = useAppSelector((state) => state.auth)

  return (
    <section className="space-y-5">
      <header className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
          Settings & preferences
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">Workspace controls</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          Theme, currency, language, and role toggles in one dedicated page.
        </p>
      </header>

      <section className="grid gap-3 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-2 xl:grid-cols-3">
        <SettingCard onClick={() => dispatch(settingsActions.toggleTheme())}>
          <span>Theme</span>
          <strong>{settings.theme}</strong>
        </SettingCard>
        <SettingCard
          onClick={() =>
            dispatch(
              settingsActions.setCurrency(
                settings.currency === 'USD' ? 'INR' : settings.currency === 'INR' ? 'EUR' : 'USD',
              ),
            )
          }
        >
          <span>Currency</span>
          <strong>{settings.currency}</strong>
        </SettingCard>
        <SettingCard
          onClick={() =>
            dispatch(
              settingsActions.setLanguage(
                settings.language === 'en' ? 'hi' : settings.language === 'hi' ? 'es' : 'en',
              ),
            )
          }
        >
          <span>Language</span>
          <strong>{settings.language.toUpperCase()}</strong>
        </SettingCard>
        <SettingCard onClick={() => dispatch(authActions.toggleRole())}>
          <span>Role</span>
          <strong>{auth.user.role}</strong>
        </SettingCard>
        <SettingCard onClick={() => dispatch(authActions.toggleTwoFactor())}>
          <span>Two-factor</span>
          <strong>{auth.twoFactorEnabled ? 'enabled' : 'disabled'}</strong>
        </SettingCard>
      </section>
    </section>
  )
}

function SettingCard({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10"
    >
      <div className="space-y-2">
        {children}
      </div>
    </button>
  )
}

export default SettingsPage
