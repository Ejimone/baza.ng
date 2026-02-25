# Header Balance Interaction

## Summary

The home screen header wallet balance is now display-only. Tapping the balance area does **not** navigate to the wallet screen.

Only the `TOP UP` action is interactive and opens the existing top-up sheet directly on the home screen.

## Behavior

- Tap wallet amount area in home header: no navigation.
- Tap `TOP UP` in home header: opens top-up popup/sheet.
- Profile wallet card behavior is unchanged.

## Files

- `components/layout/Header.tsx`
- `app/(app)/index.tsx` (existing top-up sheet flow remains in use)
