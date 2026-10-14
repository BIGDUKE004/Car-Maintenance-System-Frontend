import { configureStore, createSlice } from '@reduxjs/toolkit';
const authSlice = createSlice({
  name: 'auth', initialState: { token: localStorage.getItem('motora_token') || null },
  reducers: {
    signedIn(state, action) { state.token = action.payload; localStorage.setItem('motora_token', action.payload); },
    signedOut(state) { state.token = null; localStorage.removeItem('motora_token'); },
  },
});
export const { signedIn, signedOut } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
