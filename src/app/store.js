import { configureStore, createSlice } from '@reduxjs/toolkit';
import { roleOf } from '../lib/session';

const KEY = 'motora_token';

// Drop a stored token that has already expired so we never flash a dashboard
// that is guaranteed to bounce back to /login.
function initialToken() {
  const token = localStorage.getItem(KEY);
  if (token && !roleOf(token)) { localStorage.removeItem(KEY); return null; }
  return token || null;
}

const startToken = initialToken();

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: startToken, role: roleOf(startToken) },
  reducers: {
    signedIn(state, action) {
      state.token = action.payload;
      state.role = roleOf(action.payload);
      localStorage.setItem(KEY, action.payload);
    },
    signedOut(state) {
      state.token = null;
      state.role = null;
      localStorage.removeItem(KEY);
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
