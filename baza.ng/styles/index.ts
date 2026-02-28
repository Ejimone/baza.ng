// ─── BAZA.NG COMPONENT STYLES ────────────────────────────────────────────────
// Translated 1:1 from docs/baza-ng-v3.jsx inline styles to NativeWind classes.
// Do NOT modify these styles. The prototype is the design spec.
// Dynamic values (per-item colors, conditional states) use inline style props.

// ─── SHARED: QtyControl ──────────────────────────────────────────────────────

export const qtyControl = {
  container: "flex-row items-center gap-3",
  containerSmall: "flex-row items-center gap-2",
  button: "w-8 h-8 bg-transparent items-center justify-center border",
  buttonSmall:
    "w-[26px] h-[26px] bg-transparent items-center justify-center border",
  buttonText: "text-base font-mono",
  buttonTextSmall: "text-sm font-mono",
  value: "text-sm text-txt-primary font-mono min-w-[16px] text-center",
  valueSmall: "text-xs text-txt-primary font-mono min-w-[16px] text-center",
};

// ─── SPLASH ──────────────────────────────────────────────────────────────────

export const splash = {
  container: "flex-1 bg-[#080f09] flex-col items-center justify-center",
  membersOnly: "text-xxs tracking-wide-3xl text-[#2a4a2a] font-mono mb-7",
  logo: "text-[72px] font-black text-txt-primary font-serif tracking-tight-1",
  dot: "text-[15px] text-baza-green font-mono tracking-wide-sm",
  greeting: "mt-10 text-xs text-[#2a4a2a] font-mono tracking-wide-lg",
};

// ─── INTENT GATE ─────────────────────────────────────────────────────────────

export const intentGate = {
  container: "flex-1 bg-[#080f09] flex-col font-mono",
  header: "pt-status px-6 pb-6",
  timeLabel: "text-xxs tracking-wide-2xl text-[#2a4a2a] mb-2.5 font-mono",
  title:
    "text-[28px] text-txt-primary font-serif tracking-tight-half leading-tight",
  list: "flex-1 px-5 flex-col gap-2.5 pb-6",
  modeButton:
    "bg-[#0d1a0f] border border-[#1a2a1c] p-[18px] px-5 flex-row items-center gap-4",
  modeIcon: "w-11 h-11 items-center justify-center text-xl",
  modeTitle: "text-[15px] text-txt-primary font-serif tracking-tight-xs",
  modeDesc: "text-3xs text-[#2a4a2a] tracking-wide-md mt-1 font-mono",
  modeChevron: "text-lg opacity-40 font-mono",
};

// ─── INTENT GATE WITH BALANCE ────────────────────────────────────────────────

export const intentGateBalance = {
  container: "flex-1 bg-[#080f09] flex-col font-mono relative",
  topBar: "pt-[70px] px-6 flex-row justify-between items-start",
  walletLabel: "text-3xs tracking-wide-2xl text-[#2a4a2a] mb-[5px] font-mono",
  balanceRow: "flex-row items-center gap-3",
  balanceAmount:
    "text-[24px] text-txt-primary font-bold font-serif tracking-tight-half",
  topUpButton: "py-1 px-2.5 bg-[#4caf7d18] border border-[#4caf7d44] font-mono",
  topUpText: "text-3xs tracking-wide-lg text-baza-green font-mono",
  availableLabel: "text-3xs text-[#2a4a2a] tracking-wide-md mt-[3px] font-mono",
  avatarButton:
    "w-10 h-10 rounded-full bg-[#0d1a0f] border border-[#2a4a2c] items-center justify-center text-lg",
  greeting: "px-6 pt-5 pb-4",
  greetingTime: "text-3xs tracking-wide-lg text-[#2a4a2a] mb-1 font-mono",
  greetingTitle:
    "text-[26px] text-txt-primary font-serif tracking-tight-half leading-tight",
  scrollBody: "flex-1 px-5",
  orderCard:
    "w-full bg-gradient-to-br from-[#1a1000] to-[#1a0e00] border border-[#f5a62355] p-[14px] px-4 flex-row items-center gap-3.5 mb-3",
  orderIcon:
    "w-9 h-9 rounded-full bg-[#f5a62320] border border-[#f5a62344] items-center justify-center text-base shrink-0",
  orderLabel: "text-3xs text-baza-amber tracking-wide-xl mb-1 font-mono",
  orderTitle: "text-base text-txt-primary font-serif tracking-tight-2xs",
  orderEta: "text-xxs text-[#8a6030] mt-[3px] tracking-wide-sm font-mono",
  orderStatus: "text-3xs text-baza-amber tracking-wide-md mb-1 font-mono",
  orderView: "text-3xs text-[#7a5020] tracking-wide-md font-mono",
  modeList: "flex-col gap-2.5",
  modeButton:
    "bg-[#0d1a0f] border border-[#1a2a1c] py-4 px-5 flex-row items-center gap-4",
  modeIcon: "w-[42px] h-[42px] items-center justify-center text-lg",
  modeTitle:
    "text-lg text-txt-primary font-serif tracking-tight-xs font-medium",
  modeDesc: "text-xs text-[#2a4a2a] tracking-wide-md mt-[3px] font-mono",
  modeChevron: "text-base opacity-40 font-mono",
  stickyCart:
    "absolute bottom-5 left-5 right-5 bg-txt-primary p-[15px] px-5 flex-row items-center justify-between z-50",
  stickyCartIcon: "text-base",
  stickyCartTitle:
    "text-[11px] text-black font-mono font-bold tracking-wide-sm",
  stickyCartSub: "text-3xs text-[#555] font-mono mt-0.5 tracking-wide-sm",
  stickyCartCheckout:
    "text-[11px] font-mono font-bold text-black tracking-wide-md",
  topUpSheet: "absolute inset-0 z-[400] bg-black/85 flex-col justify-end",
  topUpSheetInner:
    "bg-[#080f09] border-t border-[#1a2a1c] rounded-t-sheet pt-6 px-6 pb-12",
  topUpHandle: "w-9 h-1 bg-[#1a2a1c] rounded-sm mx-auto mb-5",
  topUpLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-1.5",
  topUpTitle: "text-xl text-txt-primary font-serif tracking-tight-xs mb-2",
  topUpAcctBox: "bg-[#0d1a0f] border border-[#1a2a1c] p-3 px-3.5 mb-4",
  topUpAcctLabel: "text-3xs text-[#2a4a2a] tracking-wide-lg mb-1.5 font-mono",
  topUpAcctNumber: "text-base text-txt-primary tracking-wide-sm font-mono",
  topUpAcctBank: "text-3xs text-[#3a5c3a] mt-1 font-mono",
  topUpGrid: "flex-row flex-wrap gap-2 mb-3",
  topUpCustomLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  topUpCustomRow: "flex-row items-center border border-[#1a2a1c] mb-4 px-3",
  topUpCustomRowActive: "border-[#4caf7d66] bg-[#4caf7d08]",
  topUpCustomPrefix: "text-sm text-[#3a5c3a] font-mono mr-1",
  topUpCustomInput:
    "flex-1 py-3 text-sm text-txt-primary font-mono tracking-wide-sm",
  topUpConfirmBtn:
    "w-full py-[15px] font-mono text-[11px] tracking-wide-2xl font-bold mb-2.5",
  topUpCancelBtn:
    "w-full py-3 bg-transparent text-[#2a3a2a] text-xxs tracking-wide-lg font-mono",
};

// ─── BUNDLE DETAIL ───────────────────────────────────────────────────────────

export const bundleDetail = {
  container: "flex-1 flex-col font-mono",
  header: "pt-status px-[22px] pb-[18px]",
  backButton:
    "bg-transparent text-[11px] tracking-wide-lg mb-3.5 p-0 opacity-70 font-mono",
  heroRow: "flex-row items-center gap-3.5",
  heroEmoji: "text-[36px]",
  heroTitle: "text-[22px] text-txt-primary font-serif tracking-tight-sm",
  heroSavings: "text-3xs tracking-wide-lg mt-1 font-mono",
  heroDesc:
    "text-xxs text-[#3a5a3a] mt-2.5 tracking-wide-xs leading-relaxed font-mono",
  listSection: "flex-1 px-[22px] pt-2",
  listLabel: "text-3xs tracking-wide-xl text-[#2a3a2a] mb-1 pt-3 font-mono",
  itemRow: "flex-row items-center gap-3 py-3.5",
  itemEmoji: "text-xl w-7",
  itemName: "text-xs text-[#d0e0d0] tracking-tight-3xs font-mono",
  itemPrice: "text-3xs text-[#3a5a3a] mt-0.5 font-mono",
  emptyMessage:
    "text-xxs text-[#1a2a1a] text-center py-5 tracking-wide-lg font-mono",
  footer: "px-[22px] pb-10 pt-4",
  retailRow:
    "flex-row justify-between mb-1 text-3xs text-[#2a3a2a] tracking-wide-lg font-mono",
  retailValue: "line-through text-[#2a3a2a] font-mono",
  memberRow: "flex-row justify-between mb-4 text-sm tracking-wide-sm font-mono",
  memberLabel: "font-mono",
  memberPrice: "text-txt-primary font-bold font-mono",
  addToCartBtn:
    "w-full py-[15px] font-mono text-[11px] tracking-wide-2xl font-bold",
};

// ─── STOCK UP MODE ───────────────────────────────────────────────────────────

export const stockUpMode = {
  container: "flex-1 bg-[#070e08] flex-col font-mono",
  header: "pt-status px-6 pb-4 border-b border-[#0f1a10]",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#2a4a2a] tracking-wide-lg mt-1 font-mono",
  list: "flex-1 px-5 pt-4 pb-cart flex-col gap-2.5",
  bundleButton: "p-[18px] px-5 flex-row items-center gap-4",
  bundleEmoji: "text-[30px]",
  bundleTitle: "text-[15px] text-txt-primary font-serif tracking-tight-xs",
  bundleMeta: "text-3xs mt-[3px] tracking-wide-md font-mono",
  bundleDesc: "text-xxs text-[#3a5a3a] mt-1 font-mono",
  bundlePrice: "text-[13px] text-txt-primary font-mono",
  bundleInCart: "text-2xs text-baza-green mt-1 tracking-wide-md font-mono",
  bundleCustomise: "text-3xs mt-1 tracking-wide-sm font-mono",
  bundlePriceCol: "text-right min-w-[70px]",
};

// ─── MEAL PACK DETAIL ────────────────────────────────────────────────────────

export const mealPackDetail = {
  container: "flex-1 flex-col font-mono",
  hero: "h-[180px] items-center justify-center relative",
  heroEmoji: "text-[72px]",
  heroBackBtn:
    "absolute top-[52px] left-5 bg-black/50 border border-[#333] text-[#aaa] text-xxs tracking-wide-lg py-[7px] px-3.5",
  infoSection: "px-[22px] pt-4",
  cookTime: "text-3xs tracking-wide-2xl mb-[5px] font-mono",
  packTitle:
    "text-[24px] text-txt-primary font-serif tracking-tight-half mb-[5px]",
  packDesc: "text-[11px] text-[#5a7a5a] leading-relaxed mb-3.5 font-mono",
  platesBox: "flex-row items-center justify-between p-3 px-3.5 mb-1",
  platesLabel: "text-xxs tracking-wide-lg mb-0.5 font-mono",
  platesHint: "text-3xs text-[#3a5a3a] font-mono",
  removedBanner: "text-3xs tracking-wide-md py-1.5 px-3.5 mb-1 font-mono",
  ingredientList: "flex-1 px-[22px] pt-2.5",
  ingredientHint: "text-2xs tracking-wide-xl text-[#2a3a2a] mb-2.5 font-mono",
  ingredientRow: "flex-row items-center gap-2.5 py-[11px]",
  ingredientEmoji: "text-lg shrink-0",
  ingredientName: "text-xs font-mono",
  ingredientQty: "text-3xs mt-[3px] font-mono",
  ingredientQtyPrice: "text-[#3a5a3a] ml-2",
  multiplierBox: "flex-row items-center border shrink-0 overflow-hidden",
  multiplierBtn:
    "w-6 h-6 bg-transparent items-center justify-center text-xs font-mono",
  multiplierValue:
    "min-w-[18px] text-center text-[11px] text-txt-primary font-mono leading-6",
  toggleBtn: "w-7 h-7 items-center justify-center shrink-0 border",
  footer: "px-[22px] pb-10 pt-3",
  footerRow: "flex-row justify-between items-center mb-3",
  footerLabel: "text-3xs text-[#2a3a2a] tracking-wide-lg font-mono",
  footerFree: "text-3xs text-[#3a5a3a] mt-0.5 tracking-wide-sm font-mono",
  footerOldPrice: "text-3xs text-[#2a3a2a] line-through text-right font-mono",
  footerPrice: "text-[22px] text-txt-primary font-bold font-mono",
  addBtn:
    "w-full py-[15px] text-black text-[9px] tracking-wide-2xl font-mono font-bold",
};

// ─── TONIGHT (COOK A MEAL) MODE ──────────────────────────────────────────────

export const tonightMode = {
  container: "flex-1 bg-[#080a04] flex-col font-mono",
  header: "pt-status px-6 pb-4 border-b border-[#0f1a08]",
  backButton:
    "bg-transparent text-[11px] text-[#7a8a4a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#4a6a2a] tracking-wide-lg mt-1 font-mono",
  list: "flex-1 px-5 pt-4 pb-cart flex-col gap-2.5",
  packButton: "p-[18px] px-5 flex-row items-center gap-4",
  packEmoji: "text-[32px]",
  packTitle: "text-[15px] text-txt-primary font-serif tracking-tight-xs",
  packMeta: "text-3xs mt-[3px] tracking-wide-md font-mono",
  packDesc: "text-xxs text-[#4a6a3a] mt-1 font-mono",
  packPrice: "text-[13px] text-txt-primary font-mono",
  packAdded: "text-2xs text-baza-green mt-1 tracking-wide-md font-mono",
};

// ─── READY TO EAT MODE ──────────────────────────────────────────────────────

export const readyEatMode = {
  container: "flex-1 bg-[#0a0600] flex-col font-mono relative",
  header: "pt-status px-6 pb-4 border-b border-[#1a0a00]",
  backButton:
    "bg-transparent text-[11px] text-[#7a3a1a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#4a2a1a] tracking-wide-lg mt-1 font-mono",
  list: "flex-1 px-5 pt-3.5 pb-cart flex-col gap-2.5",
  itemRow: "p-3.5 px-4 flex-row items-center gap-3.5",
  itemEmoji: "w-14 h-14 items-center justify-center text-[30px] shrink-0",
  itemKitchen: "text-3xs tracking-wide-lg mb-[3px] font-mono",
  itemName: "text-[13px] text-txt-primary font-serif tracking-tight-2xs",
  itemMeta: "flex-row gap-2 mt-[5px] items-center",
  itemTime: "text-3xs text-[#4a3a2a] font-mono",
  itemOldPrice: "text-3xs text-[#3a2a1a] line-through font-mono",
  itemPrice: "text-[11px] text-txt-primary font-bold font-mono",
  addBtn:
    "py-2 px-4 bg-transparent text-[8px] tracking-wide-lg font-mono shrink-0",
  stepperCol: "flex-col items-end gap-1 shrink-0",
  stepperRow: "flex-row items-center overflow-hidden",
  stepperBtn: "w-7 h-7 items-center justify-center text-sm",
  stepperValue:
    "min-w-[26px] text-center text-xs text-txt-primary leading-7 font-mono",
  stepperLabel: "text-2xs tracking-wide-sm font-mono",
  popupOverlay: "absolute inset-0 z-[500] bg-black/[0.88] flex-col justify-end",
  popupSheet: "rounded-t-sheet pt-0 pb-11",
  popupHero: "h-[180px] items-center justify-center relative",
  popupHeroEmoji: "text-[100px] leading-none",
  popupCloseBtn:
    "absolute top-4 right-5 bg-black/50 w-8 h-8 rounded-full items-center justify-center",
  popupCloseText: "text-lg text-[#888] font-mono",
  popupTimeBadge: "absolute top-4 left-5 py-[5px] px-2.5",
  popupTimeText: "text-3xs tracking-wide-md font-mono",
  popupContent: "px-[22px] pt-4 pb-5",
  popupKitchen: "text-3xs tracking-wide-2xl mb-1 font-mono",
  popupName: "text-[22px] text-txt-primary font-serif tracking-tight-sm mb-1.5",
  popupDesc: "text-[11px] text-[#6a5a4a] leading-relaxed mb-3 font-mono",
  popupTags: "flex-row gap-1.5 flex-wrap mb-[18px]",
  popupTag: "text-2xs py-[3px] px-2 tracking-wide-sm font-mono",
  popupPlatesBox:
    "flex-row items-center justify-between mb-[18px] p-3 px-4 bg-[#ffffff0a]",
  popupPlatesLabel:
    "text-3xs text-[#4a3a2a] tracking-wide-lg mb-[3px] font-mono",
  popupPlatesEach: "text-[11px] text-[#8a6a4a] tracking-wide-sm font-mono",
  popupPlatesStepper: "flex-row items-center gap-0 overflow-hidden",
  popupPlatesBtn: "w-9 h-9 items-center justify-center text-lg",
  popupPlatesValue:
    "min-w-[40px] text-center text-base text-txt-primary font-mono leading-9",
  popupPriceRow: "flex-row justify-between items-center mb-3.5",
  popupOldPrice: "text-xxs text-[#3a2a1a] line-through font-mono",
  popupPrice: "text-[22px] text-txt-primary font-bold font-mono",
  popupFreeDelivery: "text-3xs text-[#3a5c3a] tracking-[0.12em] font-mono",
  popupAddBtn:
    "w-full py-[15px] text-black text-[11px] tracking-wide-2xl font-mono font-bold",
};

// ─── SNACKS & DRINKS MODE ────────────────────────────────────────────────────

export const snacksDrinksMode = {
  container: "flex-1 bg-[#0c0714] flex-col font-mono",
  header: "pt-status px-6 pb-4",
  backButton:
    "bg-transparent text-[11px] text-[#6a3a9a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#3a1a5a] tracking-wide-lg mt-1 font-mono",
  catFilter: "flex-row gap-2 px-5 pb-3.5",
  catButton: "py-[7px] px-4 text-3xs tracking-wide-lg font-mono",
  catButtonActive: "bg-[#c77dff22] border border-[#c77dff66] text-baza-purple",
  catButtonInactive: "bg-transparent border border-[#1a0a2a] text-[#4a2a6a]",
  grid: "flex-1 px-4 pb-cart",
  gridInner: "flex-row flex-wrap gap-2.5",
  card: "bg-[#100818] p-3.5 px-3 flex-col gap-2 w-[48%]",
  cardActive: "border border-[#c77dff44]",
  cardInactive: "border border-[#1a0a2a]",
  cardEmoji: "text-[28px] font-mono",
  cardName: "text-xs text-[#e0d0f0] leading-tight font-mono",
  cardTag: "text-2xs mt-1 tracking-wide-md font-mono",
  cardFooter: "flex-row items-center justify-between",
  cardPrice: "text-[13px] text-txt-primary font-bold font-mono",
  addBtn: "py-1.5 px-3.5 bg-transparent text-[7px] tracking-wide-md font-mono",
  stepperRow: "flex-row items-center overflow-hidden",
  stepperDec: "w-[26px] h-[26px] items-center justify-center text-sm",
  stepperDecRemove: "bg-[#2a0a0a]",
  stepperDecNormal: "bg-[#1a0a2a]",
  stepperValue:
    "min-w-[22px] text-center text-xs text-txt-primary bg-[#0c0714] leading-[26px] font-mono",
  stepperInc:
    "w-[26px] h-[26px] bg-[#1a0a2a] items-center justify-center text-sm",
};

// ─── RESTOCK (SHOP YOUR LIST) MODE ───────────────────────────────────────────

export const restockMode = {
  container: "flex-1 bg-[#070a12] flex-col font-mono",
  header: "pt-status px-5 pb-3.5",
  backButton:
    "bg-transparent text-[11px] text-[#3a5a8a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half mb-3.5",
  searchBox:
    "bg-[#0d1220] border border-[#1a2540] flex-row items-center py-[9px] px-4 gap-2.5",
  searchIcon: "text-sm text-[#3a5a8a]",
  searchInput: "flex-1 bg-transparent text-[#c8d8f0] text-[13px] font-mono",
  searchClear: "bg-transparent text-[#3a5a8a] text-base",
  searchHint: "text-3xs text-[#1a2a3a] tracking-wide-md mt-2 mb-0.5 font-mono",
  catFilter: "flex-row gap-2 pb-2.5",
  catButton: "py-1.5 px-3.5 text-3xs tracking-wide-lg font-mono shrink-0",
  catButtonActive: "bg-[#6ec6ff18] border border-[#6ec6ff55] text-baza-blue",
  catButtonInactive: "bg-transparent border border-[#1a2540] text-[#3a5a8a]",
  list: "flex-1 px-5 pb-cart",
  emptyText:
    "text-[#1a2a3a] text-[11px] tracking-wide-lg text-center pt-10 font-mono",
  itemRow:
    "flex-row items-center gap-3.5 py-[15px] mb-3 border border-[#0d1220] px-3.5",
  itemThumb:
    "w-11 h-11 shrink-0 bg-[#0d1220] items-center justify-center text-xl",
  itemThumbActive: "border border-[#6ec6ff33]",
  itemThumbInactive: "border border-[#1a2540]",
  itemName: "text-[14px] leading-tight font-mono",
  itemNameActive: "text-txt-primary",
  itemNameInactive: "text-[#c8d8f0]",
  itemBrand: "text-3xs text-[#2a4060] mt-[3px] tracking-wide-md font-mono",
  itemTotal: "text-3xs text-baza-blue mt-[3px] tracking-wide-sm font-mono",
  itemRight: "flex-col items-end gap-2 shrink-0",
  itemPrice: "text-xs text-txt-primary font-mono",
  addBtn:
    "py-[7px] px-[18px] bg-transparent border border-[#6ec6ff55] text-baza-blue text-[8px] tracking-wide-lg font-mono",
  stepperRow: "flex-row items-center border border-[#6ec6ff44] overflow-hidden",
  stepperDec: "w-8 h-[30px] items-center justify-center text-base",
  stepperDecRemove: "bg-[#1a0a0a] text-baza-red",
  stepperDecNormal: "bg-[#0d1a2a] text-baza-blue",
  stepperValue:
    "min-w-7 text-center text-[13px] text-txt-primary font-mono bg-[#0d1220] px-1 leading-[30px]",
  stepperInc:
    "w-8 h-[30px] bg-[#0d1a2a] items-center justify-center text-base text-baza-blue",
};

// ─── CHAT (HELP ME DECIDE) MODE ──────────────────────────────────────────────

export const chatMode = {
  container: "flex-1 bg-[#080a0f] flex-col font-mono",
  header:
    "pt-status px-5 pb-3.5 border-b border-[#0f1220] flex-row items-center gap-3",
  backButton: "bg-transparent text-[11px] text-baza-orange p-0",
  avatar:
    "w-[34px] h-[34px] bg-[#ff704322] border border-[#ff704333] rounded-full items-center justify-center text-base",
  headerName: "text-[13px] text-txt-primary font-mono",
  headerStatus: "text-3xs text-baza-orange tracking-wide-lg font-mono",
  messageList: "flex-1 px-5 pt-4 flex-col gap-2.5",
  messageRow: "flex-row",
  messageRowUser: "justify-end",
  messageRowBot: "justify-start",
  messageBubbleUser:
    "max-w-[78%] p-2.5 px-3.5 bg-[#ff704322] border border-[#ff704333] text-xs text-[#d0d8e0] leading-relaxed font-mono",
  messageBubbleBot:
    "max-w-[78%] p-2.5 px-3.5 bg-[#0d1220] border border-[#1a2540] text-xs text-[#d0d8e0] leading-relaxed font-mono",
  typingIndicator:
    "flex-row gap-1 p-2.5 px-3.5 bg-[#0d1220] border border-[#1a2540] w-14",
  typingDot: "w-[5px] h-[5px] bg-[#3a5a8a] rounded-full",
  quickReplies: "py-2 px-4 flex-row gap-2",
  quickReplyBtn:
    "py-[7px] px-3.5 bg-transparent border border-[#1a2a40] text-baza-blue text-xxs tracking-wide-sm font-mono",
  inputBar: "py-2.5 px-4 pb-9 flex-row gap-2.5 border-t border-[#0f1220]",
  input:
    "flex-1 bg-[#0d1220] border border-[#1a2540] py-[11px] px-3.5 text-[#c8d8f0] text-xs font-mono",
  sendBtn: "py-[11px] px-4 bg-baza-orange text-black text-sm font-mono",
};

// ─── FUND PROMPT ─────────────────────────────────────────────────────────────

export const fundPrompt = {
  overlay: "absolute inset-0 z-[500] bg-black/85 flex-col justify-end",
  sheet:
    "bg-[#080f09] border-t border-[#1a2a1c] rounded-t-sheet pt-7 px-6 pb-12 font-mono",
  handle: "w-9 h-1 bg-[#1a2a1c] rounded-sm mx-auto mb-6",
  insufficientLabel: "text-3xs tracking-wide-2xl text-baza-red mb-2 font-mono",
  title: "text-[22px] text-txt-primary font-serif tracking-tight-sm mb-1.5",
  desc: "text-[11px] text-[#3a5c3a] mb-6 leading-relaxed font-mono",
  shortfallAmount: "text-baza-amber font-mono",
  acctBox: "bg-[#0d1a0f] border border-[#1a2a1c] p-3.5 px-4 mb-5",
  acctLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  acctRow: "flex-row justify-between items-center",
  acctNumber: "text-lg text-txt-primary tracking-wide-sm font-bold font-mono",
  acctBank: "text-3xs text-[#3a5c3a] mt-1 tracking-wide-md font-mono",
  acctCopyBtn:
    "bg-transparent border border-[#1a2a1c] text-baza-green text-3xs tracking-wide-lg py-1.5 px-3",
  quickLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-3 font-mono",
  quickGrid: "flex-row flex-wrap gap-2 mb-3",
  quickBtn: "py-3 text-xs tracking-wide-xs font-mono w-[48%]",
  quickBtnActive: "bg-[#4caf7d18] border border-[#4caf7d66] text-baza-green",
  quickBtnInactive: "bg-transparent border border-[#1a2a1c] text-[#6a8a6a]",
  customLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  customRow: "flex-row items-center gap-2 mb-5",
  customPrefix: "text-sm text-[#3a5c3a] font-mono",
  customInput:
    "flex-1 bg-[#0a120a] border border-[#1a2a1c] py-[11px] px-3.5 text-txt-primary text-sm font-mono",
  customInputActive:
    "flex-1 bg-[#4caf7d08] border border-[#4caf7d55] py-[11px] px-3.5 text-txt-primary text-sm font-mono",
  confirmBtn:
    "w-full py-[15px] mb-3 text-[11px] tracking-wide-2xl font-mono font-bold",
  confirmBtnActive: "bg-baza-green text-black",
  confirmBtnInactive: "bg-[#1a2a1c] text-[#2a3a2a]",
  cancelBtn:
    "w-full py-3 bg-transparent text-[#2a3a2a] text-xxs tracking-wide-lg font-mono",
};

// ─── CART SCREEN ─────────────────────────────────────────────────────────────

export const cartScreen = {
  container: "flex-1 bg-[#050805] flex-col font-mono relative",
  header: "pt-status px-6 pb-4 border-b border-[#0a100a]",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  balanceBar: "mx-6 mt-3 p-2.5 px-3.5 flex-row justify-between items-center",
  balanceBarOk: "bg-[#0a1a0c] border border-[#4caf7d22]",
  balanceBarLow: "bg-[#1a0a0a] border border-[#e85c3a22]",
  balanceLabelOk: "text-3xs tracking-wide-lg text-[#2a4a2a] font-mono",
  balanceLabelLow: "text-3xs tracking-wide-lg text-[#4a1a1a] font-mono",
  balanceAmountOk: "text-sm text-baza-green mt-0.5 font-mono",
  balanceAmountLow: "text-sm text-baza-red mt-0.5 font-mono",
  topUpBtn:
    "py-[7px] px-3.5 bg-transparent border border-[#e85c3a55] text-baza-red text-3xs tracking-wide-lg font-mono",
  list: "flex-1 px-6 pt-3",
  emptyText:
    "text-[#1a2a1a] text-[11px] tracking-wide-lg text-center pt-[60px] font-mono",
  confirmDone: "text-center pt-[60px]",
  confirmIcon: "text-[48px] mb-5",
  confirmLabel: "text-sm text-baza-green tracking-wide-lg mb-2 font-mono",
  confirmEta: "text-xxs text-[#3a5c3a] tracking-wide-md font-mono",
  confirmBackBtn:
    "mt-8 py-3 px-7 bg-transparent border border-[#1a2a1c] text-baza-green text-xxs tracking-wide-lg font-mono",
  itemRow: "flex-row items-start gap-3.5 py-4 border-b border-[#0a100a]",
  itemEmoji: "text-xl",
  itemName: "text-xs text-[#d0e0d0] font-mono",
  itemType:
    "text-3xs text-[#2a3a2a] mt-[3px] tracking-wide-lg uppercase font-mono",
  itemRight: "flex-row items-center gap-2.5",
  itemPrice: "text-[13px] text-txt-primary font-mono",
  itemRemoveBtn:
    "bg-transparent text-[#2a3a2a] text-lg p-0 leading-none font-mono",
  footer: "px-6 pt-4 pb-11",
  subtotalRow:
    "flex-row justify-between mb-[5px] text-3xs text-[#2a3a2a] tracking-wide-lg font-mono",
  subtotalValue: "text-txt-primary font-mono",
  deliveryRow:
    "flex-row justify-between mb-4 text-3xs text-[#2a3a2a] tracking-wide-lg font-mono",
  deliveryValue: "text-baza-green font-mono",
  noteSection: "mb-3.5",
  noteLabel: "text-2xs text-[#2a3a2a] tracking-wide-lg mb-1.5 font-mono",
  noteOptional: "text-[#1a2a1a] font-mono",
  noteInput:
    "w-full bg-[#0a120a] border border-[#1a2a1c] py-[11px] px-3.5 text-[#c0d8c0] text-[11px] font-mono leading-relaxed",
  confirmBtn: "w-full py-4 font-mono text-[11px] tracking-wide-2xl font-bold",
  confirmBtnOk: "bg-txt-primary text-black",
  confirmBtnLow: "bg-baza-red text-black",
  confirmBtnCard: "bg-baza-green text-black",
};

// ─── PAYMENT METHOD SELECTOR ─────────────────────────────────────────────────

export const paymentSelector = {
  container: "mb-3.5",
  label: "text-3xs text-[#2a3a2a] tracking-wide-lg font-mono mb-2",
  row: "flex-row gap-2",
  option: "flex-1 p-3",
  optionActive: "bg-[#4caf7d0e] border border-[#4caf7d55]",
  optionInactive: "bg-[#0a120a] border border-[#1a2a1c]",
  optionIcon: "text-lg mb-1",
  optionLabel: "text-xxs text-txt-primary tracking-wide-sm font-mono",
  optionDetail: "text-3xs text-[#2a3a2a] font-mono mt-0.5",
  optionDetailRed: "text-3xs text-baza-red font-mono mt-0.5",
};

// ─── INSUFFICIENT FUNDS SHEET ────────────────────────────────────────────────

export const insufficientSheet = {
  overlay: "absolute inset-0 z-[500] bg-black/85 flex-col justify-end",
  sheet:
    "bg-[#080f09] border-t-2 border-[#4caf7d44] rounded-t-sheet pt-7 px-6 pb-12 font-mono",
  handle: "w-9 h-1 bg-[#1a2a1c] rounded-sm mx-auto mb-6",
  label: "text-3xs tracking-wide-2xl text-baza-red mb-2 font-mono",
  title: "text-[22px] text-txt-primary font-serif tracking-tight-sm mb-1.5",
  desc: "text-[11px] text-[#3a5c3a] mb-6 leading-relaxed font-mono",
  shortfallAmount: "text-baza-amber font-mono",
  payCardBtn:
    "w-full py-[15px] mb-3 bg-txt-primary text-[11px] tracking-wide-2xl font-mono font-bold items-center",
  payCardBtnText:
    "text-black text-[11px] tracking-wide-2xl font-mono font-bold text-center",
  fundWalletBtn:
    "w-full py-[15px] mb-3 bg-transparent border border-[#1a2a1c] text-[11px] tracking-wide-2xl font-mono font-bold items-center",
  fundWalletBtnText:
    "text-baza-green text-[11px] tracking-wide-2xl font-mono font-bold text-center",
  cancelBtn:
    "w-full py-3 bg-transparent text-[#2a3a2a] text-xxs tracking-wide-lg font-mono",
};

// ─── ORDERS SCREEN ───────────────────────────────────────────────────────────

export const ordersScreen = {
  container: "flex-1 bg-[#050a06] flex-col font-mono",
  header: "pt-status px-6 pb-4 border-b border-[#0a120a]",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-3 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  list: "flex-1 px-6 pt-3 pb-10",
  emptyText:
    "text-[#1a2a1a] text-[11px] tracking-wide-lg text-center pt-[60px] leading-loose font-mono",
  emptyHint: "text-[#0f1a0f] font-mono",
  orderCard: "bg-[#0a120a] border border-[#1a2a1c] p-4 mb-2.5",
  orderHeader: "flex-row justify-between items-start mb-2.5",
  orderId: "text-xxs text-txt-primary tracking-wide-sm font-mono",
  orderDate: "text-3xs text-[#2a4a2a] mt-[3px] tracking-wide-md font-mono",
  orderStatus: "text-3xs tracking-wide-lg font-mono",
  orderTotal: "text-xs text-txt-primary mt-1 font-mono",
  orderItemsSection: "border-t border-[#1a2a1c] pt-2.5",
  orderItemText: "text-xxs text-[#3a5c3a] mb-[3px] tracking-wide-xs font-mono",
  orderMore: "text-3xs text-[#2a4a2a] mt-1 tracking-wide-md font-mono",
  orderNote:
    "mt-2 p-2 px-2.5 bg-[#050a06] border border-[#0f1a10] text-xxs text-[#3a5c3a] leading-relaxed tracking-wide-xs font-mono",
  orderEta: "mt-2.5 text-3xs text-[#2a4a2a] tracking-wide-md font-mono",
};

// ─── PROFILE SCREEN ──────────────────────────────────────────────────────────

export const profileScreen = {
  container: "flex-1 bg-[#060c07] flex-col font-mono relative",
  header: "pt-status px-6 pb-5",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-4 p-0 font-mono",
  avatarRow: "flex-row items-center gap-4",
  avatar:
    "w-[52px] h-[52px] rounded-full bg-[#0d1a0f] border-2 border-[#4caf7d44] items-center justify-center text-[22px]",
  userName: "text-xl text-txt-primary font-serif tracking-tight-xs",
  memberSince: "text-3xs text-[#3a5c3a] tracking-wide-lg mt-[3px] font-mono",
  scrollBody: "flex-1 px-6 pb-[420px]",
  walletCard:
    "bg-gradient-to-br from-[#0d1a0f] to-[#0a1a12] border border-[#2a4a2c] p-[22px] mb-4",
  walletLabel: "text-3xs text-[#3a5c3a] tracking-wide-2xl mb-3 font-mono",
  walletBalance:
    "text-[36px] text-txt-primary font-bold font-serif tracking-tight-half mb-1",
  walletAvailable: "text-3xs text-[#2a4a2a] tracking-wide-md mb-3 font-mono",
  walletTopUpBtn:
    "py-[11px] px-6 bg-baza-green text-black text-xxs tracking-wide-xl font-mono font-bold",
  acctBox: "bg-[#080f09] border border-[#1a2a1c] p-4 mb-2.5",
  acctLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2.5 font-mono",
  acctRow: "flex-row justify-between items-center",
  acctNumber: "text-xl text-txt-primary tracking-wide-md font-bold font-mono",
  acctBank: "text-3xs text-[#3a5c3a] mt-[5px] tracking-wide-md font-mono",
  acctHint: "text-3xs text-[#2a4a2a] mt-[3px] tracking-wide-sm font-mono",
  acctCopyBtn:
    "py-2 px-3.5 bg-transparent border border-[#1a2a1c] text-[#3a5c3a] text-3xs tracking-wide-lg font-mono",
  acctCopyBtnActive: "bg-[#4caf7d18] border-[#4caf7d55] text-baza-green",
  navRow:
    "w-full py-[18px] px-4 bg-[#080f09] border border-[#1a2a1c] flex-row items-center justify-between mb-2.5",
  navRowIcon: "text-lg",
  navRowLabel: "text-xs text-[#d0e0d0] font-mono",
  navRowSub: "text-3xs text-[#2a4a2a] mt-[3px] tracking-wide-md font-mono",
  navRowChevron: "text-lg text-[#2a4a2a] font-mono",
  settingsLabel:
    "text-3xs text-[#1a2a1a] tracking-wide-xl mt-2 mb-2.5 pt-4 border-t border-[#0f1a10] font-mono",
  settingsRow:
    "w-full py-4 px-4 bg-[#080f09] border border-[#1a2a1c] flex-row items-center justify-between mb-2",
  settingsIcon: "text-base",
  settingsRowLabel: "text-xs text-[#d0e0d0] font-mono",
  settingsRowSub: "text-3xs text-[#2a4a2a] mt-[3px] tracking-wide-sm font-mono",
  signOutBtn:
    "w-full py-4 bg-transparent border border-[#2a1a1a] text-[#5a3a3a] text-xxs tracking-wide-xl font-mono mt-1",
  topUpSheet: "absolute inset-0 z-[400] bg-black/85 flex-col justify-end",
  topUpSheetInner:
    "bg-[#080f09] border-t border-[#1a2a1c] rounded-t-sheet pt-6 px-6 pb-12",
  topUpHandle: "w-9 h-1 bg-[#1a2a1c] rounded-sm mx-auto mb-5",
  topUpLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-1.5 font-mono",
  topUpTitle: "text-xl text-txt-primary font-serif tracking-tight-xs mb-5",
  topUpGrid: "flex-row flex-wrap gap-2 mb-3",
  topUpBtn: "py-[13px] text-[13px] font-mono w-[48%]",
  topUpBtnActive: "bg-[#4caf7d18] border border-[#4caf7d66] text-baza-green",
  topUpBtnInactive: "bg-transparent border border-[#1a2a1c] text-[#5a8a5a]",
  topUpCustomLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  topUpCustomRow: "flex-row items-center border border-[#1a2a1c] mb-4 px-3",
  topUpCustomRowActive: "border-[#4caf7d66] bg-[#4caf7d08]",
  topUpCustomPrefix: "text-sm text-[#3a5c3a] font-mono mr-1",
  topUpCustomInput:
    "flex-1 py-3 text-sm text-txt-primary font-mono tracking-wide-sm",
  topUpTransferBox: "bg-[#0d1a0f] border border-[#1a2a1c] p-3 px-3.5 mb-4",
  topUpTransferLabel:
    "text-3xs text-[#2a4a2a] tracking-wide-lg mb-1.5 font-mono",
  topUpTransferNumber: "text-base text-txt-primary tracking-wide-sm font-mono",
  topUpTransferBank: "text-3xs text-[#3a5c3a] mt-1 tracking-wide-sm font-mono",
  topUpConfirmBtn:
    "w-full py-[15px] font-mono text-[11px] tracking-wide-2xl font-bold mb-2.5",
  topUpConfirmActive: "bg-baza-green text-black",
  topUpConfirmInactive: "bg-[#1a2a1c] text-[#2a3a2a]",
  topUpCancelBtn:
    "w-full py-3 bg-transparent text-[#2a3a2a] text-xxs tracking-wide-lg font-mono",
};

// ─── NOTIFICATIONS SCREEN ────────────────────────────────────────────────────

export const notificationsScreen = {
  container: "flex-1 bg-[#070c08] flex-col font-mono",
  header: "pt-status px-6 pb-5 border-b border-[#0f1a10]",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-3.5 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#2a4a2a] tracking-wide-lg mt-1 font-mono",
  list: "flex-1 px-6 pt-2 pb-10",
  row: "flex-row items-center justify-between py-[18px] border-b border-[#0f1a10]",
  rowLabel: "text-[13px] text-[#d0e0d0] font-mono",
  rowDesc: "text-3xs text-[#2a4a2a] mt-1 tracking-wide-sm font-mono",
  togglePill: "w-[46px] h-[26px] rounded-[13px] relative shrink-0",
  togglePillOn: "bg-baza-green",
  togglePillOff: "bg-[#1a2a1c]",
  toggleDot: "absolute top-[3px] w-5 h-5 rounded-full",
  toggleDotOn: "left-[23px] bg-black",
  toggleDotOff: "left-[3px] bg-[#2a4a2a]",
  pushNotice: "mt-7 p-3.5 px-4 bg-[#0a1a0c] border border-[#1a2a1c]",
  pushLabel: "text-3xs text-[#2a4a2a] tracking-wide-lg mb-1.5 font-mono",
  pushText: "text-[11px] text-baza-green leading-relaxed font-mono",
  pushHint: "text-[#3a5c3a] font-mono",
};

// ─── DELIVERY ADDRESS SCREEN ─────────────────────────────────────────────────

export const deliveryAddressScreen = {
  container: "flex-1 bg-[#070a0c] flex-col font-mono relative",
  header: "pt-status px-6 pb-5 border-b border-[#0f1520]",
  backButton:
    "bg-transparent text-[11px] text-[#3a5a7a] tracking-wide-lg mb-3.5 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#2a4060] tracking-wide-lg mt-1 font-mono",
  list: "flex-1 px-6 pt-4 pb-10",
  addressCard: "p-4 mb-2.5",
  addressCardDefault: "bg-[#0a1220] border border-[#2a4a8a]",
  addressCardNormal: "bg-[#080c10] border border-[#1a2540]",
  addressHeader: "flex-row justify-between items-start mb-2",
  addressIconRow: "flex-row items-center gap-2.5",
  addressIcon: "text-base",
  addressLabel: "text-xs text-[#c8d8f0] font-serif",
  defaultBadge:
    "text-2xs text-baza-blue tracking-wide-lg py-[3px] px-2 border border-[#6ec6ff33]",
  setDefaultBtn:
    "text-2xs text-[#3a5a7a] tracking-wide-lg py-[3px] px-2 border border-[#1a2540] bg-transparent",
  addressText: "text-[11px] text-[#8aa0c0] leading-relaxed font-mono",
  addressLandmark: "text-3xs text-[#2a4060] mt-1 tracking-wide-sm font-mono",
  addNewBtn:
    "w-full py-[15px] bg-transparent border border-dashed border-[#1a2540] text-[#3a5a7a] text-xxs tracking-wide-xl font-mono",
  formOverlay: "absolute inset-0 z-[400] bg-black/85 flex-col justify-end",
  formSheet:
    "bg-[#080c10] border-t border-[#1a2540] rounded-t-sheet pt-6 px-6 pb-12",
  formHandle: "w-9 h-1 bg-[#1a2540] rounded-sm mx-auto mb-5",
  formLabel: "text-3xs text-[#2a4060] tracking-wide-2xl mb-1 font-mono",
  formTitle: "text-lg text-txt-primary font-serif mb-4",
  formFieldLabel: "text-2xs text-[#2a4060] tracking-wide-lg mb-1.5 font-mono",
  formInput:
    "w-full bg-[#0d1520] border border-[#1a2540] py-[11px] px-3.5 text-[#c8d8f0] text-xs font-mono mb-3",
  formSaveBtn:
    "w-full py-3.5 bg-baza-blue text-black text-xxs tracking-wide-2xl font-mono font-bold mt-2 mb-2.5",
  formCancelBtn:
    "w-full py-3 bg-transparent text-[#2a4060] text-xxs tracking-wide-lg font-mono",
};

// ─── REFER A FRIEND SCREEN ──────────────────────────────────────────────────

export const referScreen = {
  container: "flex-1 bg-[#0a0a08] flex-col font-mono",
  header: "pt-status px-6 pb-5 border-b border-[#1a1a10]",
  backButton:
    "bg-transparent text-[11px] text-[#7a7a3a] tracking-wide-lg mb-3.5 p-0 font-mono",
  title: "text-[26px] text-txt-primary font-serif tracking-tight-half",
  subtitle: "text-3xs text-[#4a4a2a] tracking-wide-lg mt-1 font-mono",
  scrollBody: "flex-1 px-6 pt-4 pb-10",
  perkGrid: "flex-row gap-2.5 mb-5",
  perkCard: "bg-[#0f0f08] border border-[#2a2a14] p-4 px-3.5 flex-1",
  perkLabel: "text-3xs text-[#4a4a2a] tracking-wide-lg mb-1.5 font-mono",
  perkAmount: "text-[22px] text-baza-amber font-serif tracking-tight-xs mb-1.5",
  perkWhen: "text-3xs text-[#5a5a3a] leading-relaxed font-mono",
  codeBox: "bg-[#0f0f08] border border-[#2a2a14] p-[18px] mb-4",
  codeLabel: "text-3xs text-[#4a4a2a] tracking-wide-xl mb-2.5 font-mono",
  codeRow: "flex-row items-center justify-between",
  codeValue: "text-[28px] text-baza-amber font-bold tracking-wide-lg font-mono",
  codeCopyBtn: "py-[9px] px-4 text-3xs tracking-wide-lg font-mono",
  codeCopyActive: "bg-[#f5a62322] border border-[#f5a62355] text-baza-amber",
  codeCopyInactive: "bg-transparent border border-[#2a2a14] text-[#5a5a3a]",
  inviteLabel: "text-3xs text-[#3a3a1a] tracking-wide-xl mb-2.5 font-mono",
  inviteRow: "flex-row gap-2 mb-4",
  inviteInput:
    "flex-1 bg-[#0f0f08] border border-[#2a2a14] py-[11px] px-3.5 text-[#d0d0b0] text-xs font-mono",
  inviteSendBtn:
    "py-[11px] px-[18px] bg-baza-amber text-black text-[11px] font-bold font-mono",
  sentLabel: "text-3xs text-[#3a3a1a] tracking-wide-xl mb-2.5 font-mono",
  sentRow:
    "text-[11px] text-[#5a5a3a] py-2.5 border-b border-[#1a1a0a] flex-row items-center gap-2.5 font-mono",
  sentCheck: "text-xs text-baza-green",
  sentStatus: "text-3xs text-[#3a3a1a] tracking-wide-sm ml-auto font-mono",
  disclaimer:
    "mt-6 text-xxs text-[#2a2a14] leading-loose tracking-wide-xs border-t border-[#1a1a0a] pt-4 font-mono",
};

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────

export const authScreen = {
  // Welcome
  welcomeContainer:
    "flex-1 bg-[#060d07] flex-col items-center justify-center font-mono px-8",
  welcomeTagline: "text-3xs tracking-wide-3xl text-[#2a4a2a] mb-7 font-mono",
  welcomeLogo:
    "text-[64px] font-black text-txt-primary font-serif tracking-tight-1 leading-none",
  welcomeDot: "text-sm text-baza-green font-mono tracking-wide-sm mb-12",
  welcomeDesc:
    "text-[13px] text-[#4a6a4a] text-center leading-loose mb-12 font-mono",
  welcomeDescHint: "text-[#2a4a2a] font-mono",
  welcomeCreateBtn:
    "w-full py-4 bg-baza-green text-black text-[11px] tracking-wide-2xl font-mono font-bold mb-3",
  welcomeSignInBtn:
    "w-full py-3.5 bg-transparent border border-[#1a2a1c] text-[#3a5c3a] text-xxs tracking-wide-xl font-mono",
  welcomeTerms:
    "mt-8 text-3xs text-[#1a2a1a] text-center leading-loose tracking-wide-sm font-mono",

  // Sign Up
  signupContainer: "flex-1 bg-[#060d07] flex-col font-mono",
  signupHeader: "pt-[60px] px-6 pb-8",
  signupBack:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-5 p-0",
  signupLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-2 font-mono",
  signupTitle: "text-[28px] text-txt-primary font-serif tracking-tight-half",
  signupForm: "flex-1 px-6",
  signupFieldLabel: "text-2xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  signupInput:
    "w-full bg-[#0d1a0f] border border-[#1a2a1c] py-3.5 px-4 text-txt-primary text-sm font-mono mb-4",
  signupRefLabel: "text-2xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  signupRefOptional: "text-[#1a2a1a] font-mono",
  signupRefRow: "flex-row gap-2",
  signupRefInput:
    "flex-1 bg-[#0d1a0f] border border-[#1a2a1c] py-3 px-3.5 text-txt-primary text-[13px] font-mono tracking-wide-sm",
  signupRefInputApplied: "border-[#4caf7d66] text-baza-green",
  signupApplyBtn: "py-3 px-4 text-3xs tracking-wide-md font-mono",
  signupApplyActive: "bg-[#4caf7d18] border border-[#4caf7d55] text-baza-green",
  signupApplyInactive: "bg-transparent border border-[#1a2a1c] text-[#3a5c3a]",
  signupRefCredit: "text-3xs text-baza-green mt-1.5 tracking-wide-sm font-mono",
  signupHint:
    "text-3xs text-[#2a4a2a] tracking-wide-sm mb-7 leading-loose font-mono",
  signupHintDim: "text-[#1a2a1a] font-mono",
  signupSubmitBtn:
    "w-full py-4 text-[11px] tracking-wide-2xl font-mono font-bold",
  signupSubmitActive: "bg-baza-green text-black",
  signupSubmitInactive: "bg-[#1a2a1c] text-[#2a3a2a]",

  // Sign In
  signinContainer: "flex-1 bg-[#060d07] flex-col font-mono",
  signinHeader: "pt-[60px] px-6 pb-8",
  signinBack:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-5 p-0",
  signinLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-2 font-mono",
  signinTitle: "text-[28px] text-txt-primary font-serif tracking-tight-half",
  signinForm: "flex-1 px-6",
  signinFieldLabel: "text-2xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  signinInput:
    "w-full bg-[#0d1a0f] border border-[#1a2a1c] py-3.5 px-4 text-txt-primary text-sm font-mono mb-7",
  signinSubmitBtn:
    "w-full py-4 text-[11px] tracking-wide-2xl font-mono font-bold",
  signinSubmitActive: "bg-baza-green text-black",
  signinSubmitInactive: "bg-[#1a2a1c] text-[#2a3a2a]",
  signinSwitch:
    "mt-5 text-3xs text-[#1a2a1a] text-center tracking-wide-sm font-mono",
  signinSwitchLink:
    "bg-transparent text-baza-green text-3xs tracking-wide-sm p-0",

  // OTP
  otpContainer: "flex-1 bg-[#060d07] flex-col font-mono",
  otpHeader: "pt-[60px] px-6 pb-8",
  otpBack:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-5 p-0",
  otpLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-2 font-mono",
  otpTitle: "text-[28px] text-txt-primary font-serif tracking-tight-half mb-2",
  otpSentTo: "text-[11px] text-[#3a5c3a] leading-relaxed font-mono",
  otpPhone: "text-txt-primary font-mono",
  otpForm: "flex-1 px-6",
  otpBoxRow: "flex-row gap-2.5 justify-center mb-8",
  otpBox:
    "w-[46px] h-14 text-center bg-[#0d1a0f] text-txt-primary text-[22px] font-mono",
  otpBoxEmpty: "border border-[#1a2a1c]",
  otpBoxFilled: "border border-[#4caf7d66]",
  otpHint:
    "text-center text-3xs text-[#2a4a2a] tracking-wide-md mb-6 font-mono",
  otpVerifyBtn:
    "w-full py-4 bg-[#1a2a1c] text-[#2a3a2a] text-[11px] tracking-wide-2xl font-mono font-bold",
  otpResendBtn:
    "mt-5 bg-transparent text-[#2a4a2a] text-3xs tracking-wide-md p-0 text-center",
};

// ─── SUPPORT CHAT SCREEN ─────────────────────────────────────────────────────

export const supportChatScreen = {
  container: "flex-1 bg-[#07090f] flex-col font-mono",
  header:
    "pt-status px-5 pb-3.5 border-b border-[#0f1220] flex-row items-center gap-3",
  backButton: "bg-transparent text-[11px] text-[#3a5a8a] p-0 mr-1",
  avatarBox: "relative",
  avatar:
    "w-9 h-9 rounded-full bg-[#0d1a2a] border border-[#1a2a4a] items-center justify-center text-base",
  humanDot:
    "absolute bottom-0 right-0 w-3 h-3 rounded-full bg-baza-green border-2 border-[#07090f]",
  headerName: "text-[13px] text-txt-primary font-mono",
  headerStatusAI: "text-3xs tracking-wide-md text-[#3a5a8a] font-mono",
  headerStatusFlagged: "text-3xs tracking-wide-md text-baza-amber font-mono",
  headerStatusHuman: "text-3xs tracking-wide-md text-baza-green font-mono",
  flaggedBadge:
    "text-2xs text-baza-amber tracking-wide-md py-1 px-2 border border-[#f5a62333] bg-[#f5a62308] font-mono",
  messageList: "flex-1 px-5 pt-3.5 flex-col gap-2.5",
  systemMessage:
    "text-center text-3xs text-[#3a5a3a] tracking-wide-md py-2 font-mono",
  msgCol: "flex-col",
  msgColUser: "items-end",
  msgColAI: "items-start",
  msgLabelHuman: "text-2xs text-baza-blue tracking-wide-md mb-1 font-mono",
  msgLabelAI: "text-2xs text-[#3a5a3a] tracking-wide-md mb-1 font-mono",
  msgBubbleUser:
    "max-w-[80%] p-2.5 px-3.5 bg-[#ff704318] border border-[#ff704333] text-xs text-[#d0d8e0] leading-relaxed font-mono",
  msgBubbleAI:
    "max-w-[80%] p-2.5 px-3.5 bg-[#0d1a0f] border border-[#1a2a1c] text-xs text-[#d0d8e0] leading-relaxed font-mono",
  msgBubbleHuman:
    "max-w-[80%] p-2.5 px-3.5 bg-[#0d1220] border border-[#2a4a8a44] text-xs text-[#d0d8e0] leading-relaxed font-mono",
  flaggedLabel: "text-2xs text-baza-amber mt-1 tracking-wide-md font-mono",
  typingIndicator:
    "flex-row gap-1 p-2.5 px-3.5 bg-[#0d1a0f] border border-[#1a2a1c] w-[52px]",
  typingDot: "w-[5px] h-[5px] bg-[#3a5a3a] rounded-full",
  quickReplies: "py-2 px-4 flex-row gap-2",
  quickReplyBtn:
    "py-[7px] px-3.5 bg-transparent border border-[#1a2a3a] text-[#3a5a7a] text-3xs tracking-wide-sm font-mono",
  inputBar: "py-2.5 px-4 pb-9 flex-row gap-2.5 border-t border-[#0f1220]",
  input:
    "flex-1 bg-[#0d1220] border border-[#1a2540] py-[11px] px-3.5 text-[#c8d8f0] text-xs font-mono",
  sendBtn: "py-[11px] px-4 bg-[#3a5a8a] text-white text-sm font-mono",
  resolvedBar:
    "py-4 px-6 pb-9 text-center text-xxs text-[#3a5c3a] tracking-wide-lg font-mono",
};

// ─── ACCOUNT SETTINGS SCREEN ─────────────────────────────────────────────────

export const accountSettingsScreen = {
  container: "flex-1 bg-[#060d07] flex-col font-mono",
  header: "pt-status px-6 pb-6 border-b border-[#0f1a10]",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-3.5 p-0 font-mono",
  headerLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-1.5 font-mono",
  headerTitle: "text-[24px] text-txt-primary font-serif tracking-tight-sm",
  form: "flex-1 px-6 pt-6 pb-10",
  fieldLabel: "text-2xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  fieldInput:
    "w-full bg-[#0d1a0f] border border-[#1a2a1c] py-[13px] px-4 text-txt-primary text-sm font-mono mb-4",
  mismatchError: "text-3xs text-baza-red tracking-wide-sm mb-3 font-mono",
  passwordHint:
    "text-3xs text-[#1a2a1a] leading-loose mb-6 tracking-wide-sm font-mono",
  emailHint: "text-3xs text-[#1a2a1a] leading-loose tracking-wide-sm font-mono",
  phoneHint: "text-3xs text-[#1a2a1a] leading-loose tracking-wide-sm font-mono",
  saveBtn:
    "w-full py-[15px] bg-baza-green text-black text-[11px] tracking-wide-2xl font-mono font-bold",
  savedConfirm:
    "mt-3.5 text-3xs text-baza-green text-center tracking-wide-lg font-mono",
};

// ─── FLOATING CART BUTTON ────────────────────────────────────────────────────

export const floatingCart = {
  button:
    "absolute top-[52px] right-4 z-[200] bg-txt-primary py-3 px-5 flex-row items-center justify-between",
  iconWrap: "flex-row items-center gap-4",
  cartIcon: "text-lg relative",
  badge:
    "absolute -top-2 -right-2.5 w-6 h-6 rounded-full bg-baza-green border-2 border-txt-primary items-center justify-center",
  badgeText: "text-xxs text-black font-bold font-mono",
  label: "text-sm text-black font-mono font-bold tracking-wide-sm",
  sub: "text-xs text-[#555] font-mono mt-[1px]",
  chevron: "text-sm font-mono font-bold text-black tracking-wide-sm",
};

// ─── WALLET SCREEN ──────────────────────────────────────────────────────────

export const walletScreen = {
  container: "flex-1 bg-[#060c07] flex-col font-mono relative",
  header: "pt-status px-6 pb-4",
  backButton:
    "bg-transparent text-[11px] text-[#3a5c3a] tracking-wide-lg mb-4 p-0 font-mono",
  balanceSection: "px-6 pb-5",
  balanceLabel: "text-3xs text-[#3a5c3a] tracking-wide-2xl mb-2 font-mono",
  balanceAmount:
    "text-[40px] text-txt-primary font-bold font-serif tracking-tight-half mb-1",
  balanceAvailable: "text-3xs text-[#2a4a2a] tracking-wide-md mb-5 font-mono",
  topUpRow: "flex-row gap-2.5",
  topUpCardBtn: "flex-1 py-3 bg-baza-green items-center",
  topUpCardBtnText: "text-black text-xxs tracking-wide-xl font-mono font-bold",
  topUpTransferBtn:
    "flex-1 py-3 bg-transparent border border-[#2a4a2c] items-center",
  topUpTransferBtnText:
    "text-baza-green text-xxs tracking-wide-xl font-mono font-bold",
  acctBox: "mx-6 bg-[#080f09] border border-[#1a2a1c] p-4 mb-1",
  acctLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2.5 font-mono",
  acctRow: "flex-row justify-between items-center",
  acctNumber: "text-xl text-txt-primary tracking-wide-md font-bold font-mono",
  acctBank: "text-3xs text-[#3a5c3a] mt-[5px] tracking-wide-md font-mono",
  acctHint: "text-3xs text-[#2a4a2a] mt-[3px] tracking-wide-sm font-mono",
  acctCopyBtn: "py-2 px-3.5 bg-transparent border border-[#1a2a1c]",
  acctCopyBtnText: "text-[#3a5c3a] text-3xs tracking-wide-lg font-mono",
  acctCopyBtnActive: "bg-[#4caf7d18] border-[#4caf7d55]",
  acctCopyBtnTextActive: "text-baza-green text-3xs tracking-wide-lg font-mono",
  divider: "mx-6 border-t border-[#0f1a10] mt-5 mb-4",
  filterRow: "flex-row gap-2 mx-6 mb-4",
  filterTab: "py-[7px] px-3.5 border",
  filterTabActive: "bg-[#4caf7d18] border-[#4caf7d66]",
  filterTabInactive: "bg-transparent border-[#1a2a1c]",
  filterTabText: "text-3xs tracking-wide-md font-mono",
  filterTabTextActive: "text-baza-green",
  filterTabTextInactive: "text-[#3a5c3a]",
  txHeader: "flex-row justify-between items-center mx-6 mb-3",
  txTitle: "text-3xs text-[#2a4a2a] tracking-wide-2xl font-mono",
  txCount: "text-3xs text-[#1a2a1a] tracking-wide-md font-mono",
  txList: "flex-1 px-6",
  emptyTx: "flex-1 items-center justify-center py-20",
  emptyTxText: "text-xxs text-[#1a2a1a] tracking-wide-2xl font-mono",
  emptyTxSub: "text-3xs text-[#1a2a1a] tracking-wide-md mt-2 font-mono",
  topUpSheet: "absolute inset-0 z-[400] bg-black/85 flex-col justify-end",
  topUpSheetInner:
    "bg-[#080f09] border-t border-[#1a2a1c] rounded-t-sheet pt-6 px-6 pb-12",
  topUpHandle: "w-9 h-1 bg-[#1a2a1c] rounded-sm mx-auto mb-5",
  topUpLabel: "text-3xs text-[#2a4a2a] tracking-wide-2xl mb-1.5 font-mono",
  topUpTitle: "text-xl text-txt-primary font-serif tracking-tight-xs mb-5",
  topUpGrid: "flex-row flex-wrap gap-2 mb-3",
  topUpBtn: "py-[13px] text-[13px] font-mono w-[48%]",
  topUpBtnActive: "bg-[#4caf7d18] border border-[#4caf7d66]",
  topUpBtnInactive: "bg-transparent border border-[#1a2a1c]",
  topUpCustomLabel: "text-3xs text-[#2a4a2a] tracking-wide-xl mb-2 font-mono",
  topUpCustomRow: "flex-row items-center border border-[#1a2a1c] mb-4 px-3",
  topUpCustomRowActive: "border-[#4caf7d66] bg-[#4caf7d08]",
  topUpCustomPrefix: "text-sm text-[#3a5c3a] font-mono mr-1",
  topUpCustomInput:
    "flex-1 py-3 text-sm text-txt-primary font-mono tracking-wide-sm",
  topUpTransferBox: "bg-[#0d1a0f] border border-[#1a2a1c] p-3 px-3.5 mb-4",
  topUpTransferLabel:
    "text-3xs text-[#2a4a2a] tracking-wide-lg mb-1.5 font-mono",
  topUpTransferNumber: "text-base text-txt-primary tracking-wide-sm font-mono",
  topUpTransferBank: "text-3xs text-[#3a5c3a] mt-1 tracking-wide-sm font-mono",
  topUpConfirmBtn:
    "w-full py-[15px] font-mono text-[11px] tracking-wide-2xl font-bold mb-2.5",
  topUpConfirmActive: "bg-baza-green",
  topUpConfirmInactive: "bg-[#1a2a1c]",
  topUpCancelBtn:
    "w-full py-3 bg-transparent text-[#2a3a2a] text-xxs tracking-wide-lg font-mono",
};

// ─── ADD MORE ITEMS SHEET ────────────────────────────────────────────────────

export const addMoreSheet = {
  handle: "w-9 h-1 bg-[#1a2540] rounded-sm mx-auto mt-3 mb-5",
  title: "text-lg text-txt-primary font-serif tracking-tight-xs px-6 mb-3",
  searchWrap: "px-5 mb-2",
  catFilter: "flex-row gap-2 pb-2.5",
  catButton: "py-1.5 px-3.5 text-3xs tracking-wide-lg font-mono shrink-0",
  catButtonActive: "bg-[#6ec6ff18] border border-[#6ec6ff55] text-baza-blue",
  catButtonInactive: "bg-transparent border border-[#1a2540] text-[#3a5a8a]",
  list: "px-5",
  emptyText:
    "text-[#1a2a3a] text-[11px] tracking-wide-lg text-center pt-10 font-mono",
};

export const addMoreButton = {
  wrapper:
    "mt-4 mb-2 mx-auto w-full py-[14px] bg-transparent border border-dashed items-center justify-center",
  text: "text-xxs tracking-wide-xl font-mono font-bold",
};
