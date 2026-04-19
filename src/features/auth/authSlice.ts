import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Role = 'trader' | 'admin'

export type AuthState = {
  isAuthenticated: boolean
  user: {
    name: string
    email: string
    role: Role
  }
  twoFactorEnabled: boolean
  sessionMinutesRemaining: number
}

const initialState: AuthState = {
  isAuthenticated: true,
  user: {
    name: 'Maya Chen',
    email: 'maya@northstartrade.com',
    role: 'trader',
  },
  twoFactorEnabled: true,
  sessionMinutesRemaining: 47,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginDemo(state) {
      state.isAuthenticated = true
    },
    logout(state) {
      state.isAuthenticated = false
    },
    toggleRole(state) {
      state.user.role = state.user.role === 'trader' ? 'admin' : 'trader'
    },
    toggleTwoFactor(state) {
      state.twoFactorEnabled = !state.twoFactorEnabled
    },
    tickSession(state) {
      state.sessionMinutesRemaining = Math.max(0, state.sessionMinutesRemaining - 1)
    },
    updateProfile(state, action: PayloadAction<{ name: string; email: string }>) {
      state.user.name = action.payload.name
      state.user.email = action.payload.email
    },
  },
})

export const authReducer = authSlice.reducer
export const authActions = authSlice.actions

