# FYM Frontend (Auth Screens)

React Native (Expo) app. This first slice covers only auth: register,
login, and a home screen that proves the connection to your backend
works by showing your real account data.

## What's here

- `App.tsx` — root navigator, switches between the auth flow (Login/Register)
  and Home based on whether a valid session exists.
- `src/context/AuthContext.tsx` — holds login state, persists the JWT
  across app restarts (`AsyncStorage`), and validates any saved token
  against `/auth/me` on launch rather than trusting it blindly.
- `src/api/` — `auth.ts` (register/login/getMe calls), `config.ts` (backend
  URL), `types.ts` (mirrors the backend's Pydantic schemas exactly).
- `src/screens/` — `LoginScreen`, `RegisterScreen`, `HomeScreen`.
- `src/theme.ts` — shared design tokens (colors, spacing, type scale).

**Verified so far:** the entire codebase type-checks cleanly
(`npx tsc --noEmit`, zero errors). Runtime behavior (actually opening
the app, tapping through the login flow) has **not** been tested yet —
this sandbox can't run a mobile simulator or Metro bundler. That part
needs you, the same way Postgres/Ollama/Overpass needed you earlier.

## Setup

```bash
cd fym_frontend
npm install
```

## CRITICAL: set your backend's LAN IP before running

Open `src/api/config.ts`. It currently has a placeholder:

```ts
export const API_BASE_URL = "http://YOUR_COMPUTERS_LAN_IP:8000";
```

If you test on a **real phone** via Expo Go, "localhost" means the
phone itself — it will never reach your Mac. You need your computer's
actual LAN IP address instead:

```bash
# On your Mac, in a terminal:
ipconfig getifaddr en0
```

That prints something like `192.168.1.42`. Update the config to:

```ts
export const API_BASE_URL = "http://192.168.1.42:8000";
```

Your phone and your Mac need to be on the **same WiFi network** for
this to work. If you're using an iOS Simulator on the same Mac as the
backend, `http://localhost:8000` works directly instead — no LAN IP
needed.

## Run your backend first

In your `fym_backend` folder (separate terminal):

```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0
```

The `--host 0.0.0.0` part matters — without it, uvicorn only listens
for connections from the same machine, which blocks your phone from
reaching it even with the correct LAN IP.

## Run the app

```bash
npx expo start
```

This prints a QR code. Scan it with your phone's camera (iOS) or the
Expo Go app (Android) — make sure Expo Go is installed first (App
Store / Play Store). Alternatively, press `i` for iOS Simulator or `a`
for Android Emulator if you have one set up.

## What to test

1. Register a new account with a fresh email.
2. You should land directly on the Home screen (register auto-logs you in).
3. Confirm your email and day_start_time show up correctly - this
   proves React Native → FastAPI → Postgres all connected successfully.
4. Tap "Log out", then log back in with the same credentials.
5. Close the app entirely and reopen it - you should land on Home
   directly without re-entering credentials (the saved token gets
   validated against `/auth/me` automatically).

## Known limitations of this slice

- No password reset, no email verification - matches the backend,
  which doesn't have these yet either (noted as a Phase 5 item).
- No CORS configuration needed for now, since Expo Go/simulators use
  native networking, not a browser - CORS only becomes relevant if a
  web build (`expo start --web`) is added later.
