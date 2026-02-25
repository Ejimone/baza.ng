# Baza.ng — Design System & Style Guide
### Every color, font, spacing rule, and component pattern. Do not freelance the design.

---

## Philosophy

The aesthetic is **dark, premium, Nigerian**. Think Lagos at night — dark backgrounds, warm accent colors, occasional neon, the texture of a high-end members club. Monospace type for data/prices/labels. Serif for display headlines. No rounded bubbles. No soft pastels. No generic "mobile app" gradients.

Every screen should feel like it was built specifically for Nigeria, not adapted from a western grocery app.

---

## Color System

### Base Backgrounds
```
#060d07   — deepest background (auth screens, profile)
#070a12   — dark navy (Shop Your List)
#080f09   — card backgrounds (profile rows)
#0a0600   — dark brown-black (Ready to Eat)
#0a1a0c   — darkest green (homepage, intent gate)
#0c0714   — deep purple-black (Snacks & Drinks)
#0d1220   — navy card (restock items)
#1a0600   — burnt brown (Jollof/Ready to Eat detail)
#1a0800   — dark copper (Protein/Suya)
#1a0e00   — dark amber (Egusi)
#1a1200   — dark gold (Breakfast bundle)
#1a1600   — dark yellow (Fried Rice)
#001a08   — very dark green (Okro)
#000d1a   — deep navy (Beverage)
```

### Accent Colors (per mode)
```
#4caf7d   — Baza Green (primary brand, Cook a Meal/Okro, success states, CTA buttons)
#f5a623   — Amber (Stock Up, Breakfast Bundle, Egusi, orders card highlight)
#e85c3a   — Red-Orange (Ready to Eat, Jollof, Protein Pack)
#c77dff   — Purple (Snacks & Drinks)
#6ec6ff   — Sky Blue (Shop Your List, Beverage Bundle, address)
#ffe082   — Pale Yellow (Fried Rice Pack, Beverage items)
```

### Text Colors
```
#f0f0e8   — primary text (headlines, prices, important info)
#c8d8f0   — secondary text (body on dark navy)
#c8e0ca   — secondary text (body on dark green)
#9ab09b   — muted text (ingredient names)
#5a7a5a   — subdued text (descriptions on green bg)
#3a5a8a   — muted text (body on navy bg)
```

### Label / Caption Colors (very low contrast — intentional)
```
#2a3a2a   — subtle label on green background
#2a4060   — subtle label on navy background
#1a2a1a   — near-invisible dividers/labels on green
#1a2540   — near-invisible borders on navy
#3a1a1a   — dark red-tinted border (remove/danger elements)
#5a2a2a   — muted red text (danger labels)
```

### Status Colors
```
#4caf7d   — success / confirmed / added
#f5a623   — warning / active order / pending
#e85c3a   — error / remove / cancel
#6ec6ff   — info / neutral action
```

---

## Typography

### Fonts
```
Display/Headlines: "DM Serif Display" (Google Font)
  import: https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap
  Use for: Screen titles, product names, bundle names, hero text

Mono/Data: "monospace" (system fallback — no import needed)
  Use for: Prices, quantities, buttons, labels, codes, OTP digits,
           account numbers, category pills, timestamps
           
Body: "monospace" (same — consistent throughout)
  Note: There is NO sans-serif body font. Everything is either DM Serif Display
        or monospace. This is intentional and defines the Baza look.
```

### Type Scale
```
9px   — uppercase labels, micro-captions, category pills, letterSpacing: 0.15–0.3em
10px  — secondary labels, brand names, cook time
11px  — body text, button text, descriptions
12px  — item names, setting rows, input text
13px  — list item names, emphasized body
14px  — prices in lists, medium emphasis
16px  — OTP digits
18px  — stepper numbers
22–24px — section subtitles, pack prices
26px  — screen titles (monospace or serif depending on screen)
24–26px — Screen titles (DM Serif Display)
80–100px — emoji heroes (product detail screens, popup modals)
```

### Letter Spacing Rules
```
All uppercase labels: letterSpacing 0.15em minimum, up to 0.35em
Prices: letterSpacing 0 (numbers don't need tracking)
Button text: letterSpacing 0.25–0.35em (always uppercase, always tracked out)
Body text: letterSpacing 0 or default
```

---

## Spacing System

No formal spacing scale — use these values:
```
4px   — gap between micro elements (tags, icon+text)
6–8px — gap within components (label above input)
10–12px — gap between list items
14–16px — standard padding for cards/rows
18–22px — standard horizontal padding for screen content
20–24px — screen horizontal padding
40–44px — top padding accounting for status bar (mobile)
80px  — bottom padding for scroll containers (above floating cart)
```

---

## Border System

```
Standard card border: 1px solid [accentColor] + "22" (8% opacity)
Active/selected border: 1px solid [accentColor] + "55" (33% opacity)
Dividers: 1px solid [accentColor] + "0a" (4% opacity) — barely visible
Danger border: 1px solid #3a1a1a
Input border: 1px solid #1a2a1c (green context) or #1a2540 (navy context)
```

No border-radius anywhere except:
```
Popup modals: borderRadius "20px 20px 0 0" (bottom sheet only)
Circular elements: borderRadius "50%" (icon containers, status dots)
```

The rest of the app is **sharp corners**. No rounded cards. No pill buttons (except the floating cart).

---

## Component Patterns

### Screen Structure (every screen)
```
Full height container
  ↓
Header area (padding-top: 52px to clear status bar)
  - Back button: text only, uppercase, monospace, accent color, no background
  - Optional mode label (9px, tracked, accent color)
  - Screen title (24–26px DM Serif Display)
  - Optional subtitle (9px, monospace, muted)
  ↓
Scrollable content area (flex: 1, overflowY: auto)
  ↓
Fixed footer (checkout buttons, sticky totals)
```

### Back Button
```
← BACK
Font: monospace, 11px, letterSpacing: 0.2em
Color: muted accent (e.g. #7a3a1a for red screens, #3a5a8a for navy)
Background: none, border: none, padding: 0
```

### List Item Row (Shop Your List pattern — most reusable)
```
Horizontal flex, alignItems: center, gap: 14px
Padding: 15px 0
Border-bottom: 1px solid #0d1220
  Left: emoji thumbnail (44×44, bordered)
  Center: name (12px) + brand (9px uppercase) + inline total if in cart
  Right: price (12px) + ADD button → stepper
```

### ADD → Stepper Pattern
When qty is 0: show `ADD` button (border only, accent color)
When qty > 0: replace with inline stepper [−][qty][+]
- When qty === 1, − button turns red/× to remove
- This is the core interaction pattern across Shop Your List, Snacks & Drinks, and bundles

### Floating Cart Button
```
Position: fixed, top: 12px, right: 16px, zIndex: 200
Background: white pill
Border-radius: 50px
Contains: 🛒 + item count badge (green circle) + total price
Appears when cart has items AND user is on a shopping screen
Scale animation on item add: scale(1.12) → scale(1)
```

### Quantity Control (QtyControl component)
```
[−] [value] [+]
− button: 32×32, transparent bg, border accent (disabled when at min)
+ button: 32×32, transparent bg, border accent (disabled when at max)
Value: 14px monospace, min-width 16px, centered
```

### Category Filter Tabs
```
Horizontal scrollable row, gap: 8px, no scrollbar visible
Each tab: 9px monospace, tracked, uppercase
  Inactive: border #1a2540, color #3a5a8a, transparent bg
  Active: border accent+"55", color accent, bg accent+"18"
Transition: all 0.15s
```

### Bottom Sheet Modal
```
Overlay: rgba(0,0,0,0.88) + backdropFilter blur(10px)
Sheet: slides up from bottom, borderRadius 20px 20px 0 0
Border-top: 2px solid accentColor+"44"
Animation: translateY(24px) → translateY(0), opacity 0 → 1, 0.25s ease
Close: × button top-right, circular, dark bg
```

### Wallet Card
```
Background: dark green gradient #070e08 → #0a1a0c
Border: 1px solid #1a3a1c
Contains: WALLET BALANCE label + ₦ amount (large, bold) + account number + bank name
Top-up button: border only, accent green
```

### Toast / Success Banner
```
Slide down from top
Background: #4caf7d18, border: 1px solid #4caf7d44
Text: 10px monospace, #4caf7d, letterSpacing 0.2em
Duration: 2.5 seconds
```

---

## Screen-by-Screen Color Map

| Screen | Background | Primary Accent |
|--------|-----------|----------------|
| Auth (Welcome/SignIn/SignUp/OTP) | #060d07 | #4caf7d |
| Intent Gate (Home) | #0a1a0c | #4caf7d |
| Stock Up | #060d07 | per bundle color |
| Bundle Detail | bundle.bg | bundle.color |
| Cook a Meal | #060d07 | per pack color |
| Meal Pack Detail | pack.bg | pack.color |
| Ready to Eat | #0a0600 | #e85c3a |
| Snacks & Drinks | #0c0714 | #c77dff |
| Shop Your List | #070a12 | #6ec6ff |
| Help Me Decide | #060d07 | #4caf7d |
| Cart | #060d07 | #4caf7d |
| Orders | #060d07 | #f5a623 (active orders) |
| Profile | #060d07 | #4caf7d |
| Notifications | #060d07 | #4caf7d |
| Address | #060d07 | #6ec6ff |
| Refer a Friend | #060d07 | #f5a623 |
| Support Chat | #060d07 | #4caf7d (AI) / #6ec6ff (human agent) |
| Account Settings | #060d07 | #4caf7d |

---

## Animation Reference

```
fadeUp: opacity 0 → 1, translateY(10px) → translateY(0), 0.3s ease
  Used on: list items (staggered by index × 0.04–0.06s), cards, success messages

slideUp: opacity 0 → 1, translateY(24px) → translateY(0), 0.25s ease
  Used on: bottom sheet modals

scaleIn: scale(0.95) → scale(1), 0.2s ease
  Used on: buttons on tap

cartBump: scale(1) → scale(1.12) → scale(1), 0.15s
  Used on: floating cart button when item added

dot pulse: opacity 0.4 → 1, 1.2s ease infinite
  Used on: active order dot indicator
```

---

## React Native / NativeWind Translation Guide

When porting from web prototype to React Native:

| Web | React Native |
|-----|-------------|
| `div` | `View` |
| `button` | `TouchableOpacity` or `Pressable` |
| `span` / `p` | `Text` |
| `input` | `TextInput` |
| `overflow-y: auto scroll div` | `ScrollView` or `FlatList` |
| `position: fixed` | `position: absolute` inside a relative View, or use `Modal` |
| `backdropFilter: blur` | `BlurView` from expo-blur |
| CSS `@keyframes` | `useAnimatedStyle` + `withTiming` from Reanimated |
| `transition: all 0.2s` | `withTiming(value, { duration: 200 })` |
| `fontFamily: monospace` | `fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'` |
| `letter-spacing` | `letterSpacing` (works the same) |
| `inset: 0` | `top: 0, left: 0, right: 0, bottom: 0` |

**Critical:** In React Native, `Text` must wrap all text. You cannot put text directly in a `View`. Every string must be inside `<Text>`.

---

## NativeWind Color Config

In `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'baza-green': '#4caf7d',
        'baza-amber': '#f5a623',
        'baza-red': '#e85c3a',
        'baza-purple': '#c77dff',
        'baza-blue': '#6ec6ff',
        'baza-yellow': '#ffe082',
        'baza-bg': '#060d07',
        'baza-bg-green': '#0a1a0c',
        'baza-bg-navy': '#070a12',
        'baza-text': '#f0f0e8',
        'baza-muted': '#5a7a5a',
      },
      fontFamily: {
        'serif': ['DMSerifDisplay_400Regular'],
        'mono': ['SpaceMono_400Regular'],
      }
    }
  }
}
```

---

## Dos and Don'ts

**DO:**
- Use sharp corners everywhere (except bottom sheet modal top)
- Track out all uppercase labels
- Make prices large and prominent
- Dim list items to ~35% opacity when removed/disabled
- Scale list item animations by index for staggered entry
- Use emoji as the primary visual element (not images — no image loading delays)
- Show ₦ symbol always, format with .toLocaleString()

**DON'T:**
- Add rounded corners to cards, buttons, or list items
- Use any sans-serif font
- Use white or light backgrounds (the whole app is dark)
- Add drop shadows (use borders for depth instead)
- Add padding/margin that breaks the flat edge-to-edge card look
- Use blue for anything other than Shop Your List / Address screens
- Make buttons look like standard Material/iOS buttons
