# Theme Mode Toggle

## Summary

Added an app-wide Light/Dark theme switch that can be changed from Account Settings.

The preference is persisted locally on the device and restored during app startup, so the selected theme remains active after relaunch.

## User Flow

1. Open Profile.
2. Go to Account Settings.
3. Toggle `APP THEME` between Light and Dark.
4. The app updates immediately and keeps the choice for next launch.

## Implementation Details

- Added a dedicated theme store: `stores/themeStore.ts`
  - State: `mode` (`"light" | "dark"`), `hydrated`
  - Actions: `hydrate`, `setMode`, `toggleMode`
- Added local persistence helpers in `utils/storage.ts`
  - `getThemeMode()`
  - `setThemeMode(mode)`
- Added shared palette tokens in `constants/appTheme.ts`
  - `appTheme.dark`
  - `appTheme.light`
  - `getThemePalette(mode)`
- Wired global theme hydration and status bar style in `app/_layout.tsx`.
- Applied theme background to navigation stacks:
  - `app/(app)/_layout.tsx`
  - `app/(auth)/_layout.tsx`
  - `app/(app)/settings/_layout.tsx`
  - `app/(app)/modes/_layout.tsx`
- Updated `components/layout/ScreenWrapper.tsx` to use the selected theme background by default.
- Added the theme toggle UI in `app/(app)/settings/account.tsx`.

## Phase 2: Shared UI Tokenization

To improve cross-screen consistency in light mode, key shared primitives now read from theme tokens:

- `components/layout/Header.tsx`
  - Wallet label and balance text now use themed text colors.
  - Avatar surface/border now use themed card + border colors.
  - Top-up pill keeps brand accent while adjusting tone by theme.
- `components/ui/Button.tsx`
  - Replaced placeholder with reusable component.
  - Supports `primary`, `secondary`, `ghost` variants with theme-aware surface/text.
- `components/ui/Card.tsx`
  - Replaced placeholder with reusable container using themed card/background and border.
- `components/ui/Input.tsx`
  - Replaced placeholder with reusable text input primitive.
  - Supports optional `label` and `error` props.
  - Applies themed surface/border/text + placeholder colors.

## Phase 3: High-Impact Screen Migration

Migrated remaining high-impact dark-only surfaces/text in profile, wallet, and settings-list flows:

- `app/(app)/profile.tsx`
  - Themed header/avatar text and borders.
  - Themed account box, nav/settings rows, and top-up sheet/input states.
- `app/(app)/wallet.tsx`
  - Themed header/back text, account box, transfer button, and top-up sheet/input states.
- Settings list screens:
  - `app/(app)/settings/notifications.tsx`
  - `app/(app)/settings/address.tsx`
  - `app/(app)/settings/refer.tsx`
  - `app/(app)/settings/support.tsx`
  - Themed headers, card/list surfaces, secondary text, and input placeholders.
- Wallet-related shared blocks used by these screens:
  - `components/wallet/WalletCard.tsx`
  - `components/wallet/TransactionItem.tsx`

These updates target readability and contrast in light mode while preserving existing layout and interaction behavior.

## Phase 4: Remaining Auth + Modes/Detail Migration

Migrated the remaining screens that still had hardcoded dark fallback colors:

- Auth flow:
  - `app/(auth)/index.tsx`
  - `app/(auth)/signin.tsx`
  - `app/(auth)/signup.tsx`
  - `app/(auth)/otp.tsx`
  - Replaced hardcoded placeholder/disabled text colors with theme tokens.
- Modes and detail flows:
  - `app/(app)/modes/stockup.tsx`
  - `app/(app)/modes/cookmeal.tsx`
  - `app/(app)/modes/snacks.tsx`
  - `app/(app)/modes/chat.tsx`
  - `app/(app)/modes/shoplist.tsx`
  - `app/(app)/modes/readyeat.tsx`
  - `app/(app)/modes/stockup/[id].tsx`
  - `app/(app)/modes/cookmeal/[id].tsx`
  - Replaced hardcoded fallback/error/empty-state text colors, and adapted popup/sheet/status bar presentation for both light and dark modes.

Result: lint now reports no errors (warnings only), and theme switching behavior is applied across auth + primary mode/detail flows.

## Notes

- This implementation now includes global background/status bar behavior, Account Settings controls, and key shared UI primitives (button/card/input/header).
- Existing screen-specific hardcoded colors still present in some mode/detail/auth screens can be migrated incrementally for full visual parity.
