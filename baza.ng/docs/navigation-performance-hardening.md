# Navigation Performance Hardening

## Goal

Reduce tab navigation latency and prevent transition stutter by moving non-critical work out of the transition window and reducing avoidable rerenders.

## Implemented Changes

- Deferred app-level warmup calls until after navigation interactions using `InteractionManager.runAfterInteractions` in app layout.
- Added tap-to-transition and tap-to-first-shell-paint instrumentation using `utils/perfLogger.ts`.
- Memoized navigation surfaces:
  - `BottomNav` now uses `React.memo` and memoized icon/press handlers.
  - `Header` now uses `React.memo`.
  - Route visibility computation for bottom nav is memoized in app layout.
- Split home screen loading into priority lanes:
  - Immediate lane: wallet balance and active-order summary.
  - Deferred lane: catalog warmup fetches (bundles, meal packs, ready-to-eat, snacks, restock).
- Added progressive placeholders on home screen:
  - Search results loading placeholders while deferred catalog data is pending.
  - Active-order skeleton while order summary is loading.
  - Background catalog loading section placeholder.
- Deferred wallet/profile mount-heavy work until after interactions.
  - Wallet: account + transaction fetch deferred; polling startup deferred.
  - Profile: initial orders fetch reduced from 100 to 20 and deferred.

## Hook/Data-Flow Optimizations

- `useCart`:
  - Combined total/count derivation into one memoized pass.
  - Added memoized lookup map to avoid repeated linear `find`/`some` scans for product+type lookups.
- `useProducts`:
  - Consolidated product slices into one object state for fewer separate state commits.
- `useOrders`:
  - Consolidated orders + pagination updates into a single state commit.
- `useWallet`:
  - Made polling startup interaction-aware and cleanup-safe.

## Why This Is Faster

- Navigation animations start sooner because heavy network/prefetch logic is delayed until after interaction completion.
- Fewer unnecessary rerenders in tab bar/header reduce JS work during route changes.
- Less synchronous computation in cart lookup paths reduces per-render and per-action overhead.
- Progressive placeholders avoid blank waiting states and keep first paint immediate while API calls complete.

## Validation

Use the perf logs in development:

- `nav tap -> transition start`
- `nav tap -> first shell paint`

Enable logs in production-like builds with `EXPO_PUBLIC_PERF_DEBUG=true` when needed.
