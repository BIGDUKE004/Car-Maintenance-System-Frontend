const P = {
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0", mail: "M3 6h18v12H3zM3 7l9 6 9-6", lock: "M6 11h12v9H6zM8 11V8a4 4 0 018 0v3",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z",
  car: "M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v2M17 19v2", wrench: "M14 6a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 01-2-2z", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  add: "M10 12a4 4 0 100-8 4 4 0 000 8zM3 21a7 7 0 0114 0M19 8v6M16 11h6",
  home: "M3 11l9-8 9 8M5 10v10h14V10", card: "M3 6h18v12H3zM3 10h18", bell: "M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0", grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", users: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21a7 7 0 0114 0M17 4a4 4 0 010 7M22 21a7 7 0 00-4-6", image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9h.01", chart: "M4 20V10M10 20V4M16 20v-8M22 20H2", gear: "M12 9a3 3 0 100 6 3 3 0 000-6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.500 4 8l-1 3 2 1v2l-2 1 1 3 2-.5L7.500 19l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z", clock: "M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z", check: "M5 12l5 5 9-10", alert: "M12 8v5M12 17h.01M12 3l10 18H2z" };
export const Ic = ({ n, s = 20 }) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>;

