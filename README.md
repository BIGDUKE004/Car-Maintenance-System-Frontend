# Motora web

React + Vite frontend for the Motora API.

    cp .env.example .env     # set VITE_API_URL to your API
    npm install
    npm run dev              # http://localhost:5173

Optional: put a hero photo at `public/hero.jpg` (the landing page falls back to a navy gradient).
Customers land on /app, administrators on /admin (decided by the role in the login token).
