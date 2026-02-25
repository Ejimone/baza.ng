import { useState, useRef, useEffect } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const BUNDLE_CATALOG = {
  b1: {
    id: "b1", name: "Breakfast Bundle", emoji: "🌅", color: "#f5a623", bg: "#1a1200",
    desc: "Everything for a solid week of breakfasts",
    tags: ["Feeds 4", "7 days"],
    basePrice: 18400, savings: 22,
    items: [
      { id: "i1", name: "Rolled Oats 1kg", emoji: "🌾", unitPrice: 1800, qty: 1, min: 0, max: 5 },
      { id: "i2", name: "Eggs (crate of 30)", emoji: "🥚", unitPrice: 2800, qty: 1, min: 0, max: 4 },
      { id: "i3", name: "Sliced Bread", emoji: "🍞", unitPrice: 900, qty: 2, min: 0, max: 6 },
      { id: "i4", name: "Peak Milk (sachet ×12)", emoji: "🥛", unitPrice: 3400, qty: 1, min: 0, max: 4 },
      { id: "i5", name: "Lipton Tea (×50 bags)", emoji: "🍵", unitPrice: 1200, qty: 1, min: 0, max: 3 },
      { id: "i6", name: "Wildflower Honey 500g", emoji: "🍯", unitPrice: 2600, qty: 1, min: 0, max: 3 },
      { id: "i7", name: "Butter 250g", emoji: "🧈", unitPrice: 1900, qty: 1, min: 0, max: 4 },
      { id: "i8", name: "Strawberry Jam 340g", emoji: "🍓", unitPrice: 1800, qty: 1, min: 0, max: 3 },
    ]
  },
  b2: {
    id: "b2", name: "Protein Pack", emoji: "💪", color: "#e85c3a", bg: "#1a0800",
    desc: "High-protein essentials, freezer-ready",
    tags: ["High protein", "Freezer-ready"],
    basePrice: 24800, savings: 18,
    items: [
      { id: "p1", name: "Chicken (whole, 1.5kg)", emoji: "🍗", unitPrice: 4800, qty: 1, min: 0, max: 5 },
      { id: "p2", name: "Beef (1kg)", emoji: "🥩", unitPrice: 5200, qty: 1, min: 0, max: 5 },
      { id: "p3", name: "Fresh Tilapia (1kg)", emoji: "🐟", unitPrice: 3600, qty: 1, min: 0, max: 4 },
      { id: "p4", name: "Eggs (crate of 30)", emoji: "🥚", unitPrice: 2800, qty: 1, min: 0, max: 4 },
      { id: "p5", name: "Black-eyed Beans 1kg", emoji: "🫘", unitPrice: 2200, qty: 1, min: 0, max: 6 },
      { id: "p6", name: "Groundnuts 500g", emoji: "🥜", unitPrice: 1400, qty: 1, min: 0, max: 6 },
    ]
  },
  b3: {
    id: "b3", name: "Pantry Staples", emoji: "🏠", color: "#4caf7d", bg: "#001a0a",
    desc: "The foundation. Monthly stock for a full house.",
    tags: ["Monthly stock", "Most popular"],
    basePrice: 31200, savings: 25,
    items: [
      { id: "s1", name: "Golden Penny Rice 5kg", emoji: "🌾", unitPrice: 7200, qty: 1, min: 0, max: 5 },
      { id: "s2", name: "Garri (Ijebu) 5kg", emoji: "🌽", unitPrice: 4500, qty: 1, min: 0, max: 4 },
      { id: "s3", name: "Flour 2kg", emoji: "🌫️", unitPrice: 2100, qty: 1, min: 0, max: 6 },
      { id: "s4", name: "Vegetable Oil 5L", emoji: "🫙", unitPrice: 8100, qty: 1, min: 0, max: 4 },
      { id: "s5", name: "Tomato Paste ×6 cans", emoji: "🍅", unitPrice: 2100, qty: 1, min: 0, max: 5 },
      { id: "s6", name: "Maggi Cubes ×50", emoji: "🧂", unitPrice: 950, qty: 2, min: 0, max: 8 },
      { id: "s7", name: "Table Salt 1kg", emoji: "🧂", unitPrice: 550, qty: 1, min: 0, max: 4 },
      { id: "s8", name: "Dangote Sugar 2kg", emoji: "🍬", unitPrice: 3200, qty: 1, min: 0, max: 4 },
      { id: "s9", name: "Semolina 1kg", emoji: "🟡", unitPrice: 1800, qty: 1, min: 0, max: 4 },
      { id: "s10", name: "Indomie Noodles ×40", emoji: "🍜", unitPrice: 4800, qty: 1, min: 0, max: 3 },
    ]
  },
  b4: {
    id: "b4", name: "Beverage Box", emoji: "🧃", color: "#6ec6ff", bg: "#000d1a",
    desc: "Drinks for the whole house, mixed and ready",
    tags: ["Mixed", "Chilled ready"],
    basePrice: 14600, savings: 20,
    items: [
      { id: "v1", name: "Eva Water 75cl ×12", emoji: "💧", unitPrice: 1800, qty: 1, min: 0, max: 8 },
      { id: "v2", name: "Malt (Big Stout) ×6", emoji: "🍺", unitPrice: 2400, qty: 1, min: 0, max: 6 },
      { id: "v3", name: "Chivita Juice 1L ×4", emoji: "🧃", unitPrice: 3200, qty: 1, min: 0, max: 5 },
      { id: "v4", name: "Coca-Cola 50cl ×12", emoji: "🥤", unitPrice: 3600, qty: 1, min: 0, max: 4 },
      { id: "v5", name: "Sprite 50cl ×12", emoji: "🥤", unitPrice: 3400, qty: 1, min: 0, max: 4 },
      { id: "v6", name: "Hollandia Yoghurt ×6", emoji: "🍶", unitPrice: 2800, qty: 1, min: 0, max: 4 },
    ]
  }
};

const MEAL_PACKS = [
  {
    id: "m1", name: "Jollof Pack", emoji: "🍚", baseTime: 45, basePlates: 4, basePrice: 8900,
    color: "#e85c3a", bg: "#1a0600",
    desc: "Everything for a full pot of party jollof",
    items: [
      { name: "Long grain rice", unit: "cups", perPlate: 0.5, emoji: "🌾" },
      { name: "Fresh tomatoes", unit: "pcs", perPlate: 1.5, emoji: "🍅" },
      { name: "Tatashe peppers", unit: "pcs", perPlate: 0.5, emoji: "🫑" },
      { name: "Scotch bonnet", unit: "pcs", perPlate: 0.25, emoji: "🌶️" },
      { name: "Chicken", unit: "pieces", perPlate: 1, emoji: "🍗" },
      { name: "Seasoning cube", unit: "cubes", perPlate: 0.5, emoji: "🧂" },
      { name: "Vegetable oil", unit: "tbsp", perPlate: 2, emoji: "🫙" },
      { name: "Onions", unit: "medium", perPlate: 0.5, emoji: "🧅" },
    ]
  },
  {
    id: "m2", name: "Egusi Soup Pack", emoji: "🥣", baseTime: 60, basePlates: 4, basePrice: 11200,
    color: "#f5a623", bg: "#1a0e00",
    desc: "A proper Sunday soup, all in one bag",
    items: [
      { name: "Egusi seeds", unit: "cups", perPlate: 0.5, emoji: "🟡" },
      { name: "Pumpkin leaves", unit: "handfuls", perPlate: 1, emoji: "🌿" },
      { name: "Beef", unit: "pieces", perPlate: 2, emoji: "🥩" },
      { name: "Stockfish", unit: "pieces", perPlate: 0.5, emoji: "🐟" },
      { name: "Palm oil", unit: "tbsp", perPlate: 2, emoji: "🫙" },
      { name: "Crayfish", unit: "tbsp", perPlate: 1, emoji: "🦐" },
      { name: "Peppers", unit: "pcs", perPlate: 0.75, emoji: "🌶️" },
      { name: "Onions", unit: "medium", perPlate: 0.5, emoji: "🧅" },
    ]
  },
  {
    id: "m3", name: "Okro Pack", emoji: "🫛", baseTime: 30, basePlates: 3, basePrice: 7400,
    color: "#4caf7d", bg: "#001a08",
    desc: "Quick, fresh, goes well with anything",
    items: [
      { name: "Fresh okro", unit: "pcs", perPlate: 8, emoji: "🫛" },
      { name: "Shrimp", unit: "handfuls", perPlate: 1, emoji: "🦐" },
      { name: "Beef", unit: "pieces", perPlate: 2, emoji: "🥩" },
      { name: "Palm oil", unit: "tbsp", perPlate: 1.5, emoji: "🫙" },
      { name: "Peppers", unit: "pcs", perPlate: 0.5, emoji: "🌶️" },
      { name: "Crayfish", unit: "tbsp", perPlate: 0.75, emoji: "🦐" },
    ]
  },
  {
    id: "m4", name: "Fried Rice Pack", emoji: "🍳", baseTime: 50, basePlates: 4, basePrice: 9600,
    color: "#ffe082", bg: "#1a1600",
    desc: "Smoky, rich, restaurant quality at home",
    items: [
      { name: "Parboiled rice", unit: "cups", perPlate: 0.5, emoji: "🌾" },
      { name: "Mixed vegetables", unit: "cups", perPlate: 0.5, emoji: "🥦" },
      { name: "Chicken liver", unit: "pieces", perPlate: 2, emoji: "🍗" },
      { name: "Eggs", unit: "pcs", perPlate: 1, emoji: "🥚" },
      { name: "Soy sauce", unit: "tbsp", perPlate: 1, emoji: "🍶" },
      { name: "Butter", unit: "tbsp", perPlate: 1, emoji: "🧈" },
      { name: "Green onions", unit: "stalks", perPlate: 2, emoji: "🌿" },
    ]
  },
];

const RESTOCK_ITEMS = [
  { id: "r1", name: "Indomie Noodles ×40", brand: "Indomie", price: 4800, emoji: "🍜", category: "Grains" },
  { id: "r2", name: "Indomie Noodles ×10", brand: "Indomie", price: 1350, emoji: "🍜", category: "Grains" },
  { id: "r3", name: "Peak Milk ×12 sachet", brand: "Peak", price: 3400, emoji: "🥛", category: "Dairy" },
  { id: "r4", name: "Peak Milk ×6 sachet", brand: "Peak", price: 1750, emoji: "🥛", category: "Dairy" },
  { id: "r5", name: "Vegetable Oil 5L", brand: "Kings", price: 8100, emoji: "🫙", category: "Cooking" },
  { id: "r6", name: "Vegetable Oil 2L", brand: "Kings", price: 3600, emoji: "🫙", category: "Cooking" },
  { id: "r7", name: "Golden Penny Rice 5kg", brand: "Golden Penny", price: 7200, emoji: "🌾", category: "Grains" },
  { id: "r8", name: "Golden Penny Rice 10kg", brand: "Golden Penny", price: 13800, emoji: "🌾", category: "Grains" },
  { id: "r9", name: "Maggi Cubes ×50", brand: "Maggi", price: 950, emoji: "🧂", category: "Seasoning" },
  { id: "r10", name: "Gino Tomato Paste ×6", brand: "Gino", price: 2100, emoji: "🍅", category: "Cooking" },
  { id: "r11", name: "Garri (Ijebu) 5kg", brand: "Farm Fresh", price: 4500, emoji: "🌽", category: "Grains" },
  { id: "r12", name: "Dangote Sugar 2kg", brand: "Dangote", price: 3200, emoji: "🍬", category: "Staples" },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Math.round(n).toLocaleString()}`;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// ─── SHARED UI ───────────────────────────────────────────────────────────────

function QtyControl({ value, min = 0, max = 99, onChange, color = "#4caf7d", size = "normal" }) {
  const s = size === "small";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: s ? 8 : 12 }}>
      <button onClick={() => onChange(clamp(value - 1, min, max))} style={{
        width: s ? 26 : 32, height: s ? 26 : 32, background: "transparent",
        border: `1px solid ${value <= min ? "#1a2a1a" : color + "55"}`,
        color: value <= min ? "#1a2a1a" : color,
        fontSize: s ? 14 : 16, cursor: value <= min ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>−</button>
      <span style={{ fontSize: s ? 12 : 14, color: "#f0f0e8", fontFamily: "monospace", minWidth: 16, textAlign: "center" }}>{value}</span>
      <button onClick={() => onChange(clamp(value + 1, min, max))} style={{
        width: s ? 26 : 32, height: s ? 26 : 32, background: "transparent",
        border: `1px solid ${value >= max ? "#1a2a1a" : color + "55"}`,
        color: value >= max ? "#1a2a1a" : color,
        fontSize: s ? 14 : 16, cursor: value >= max ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>+</button>
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      width: "100%", height: "100%", background: "#080f09",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#2a4a2a", fontFamily: "monospace", marginBottom: 28 }}>MEMBERS ONLY</div>
      <div style={{ fontSize: 72, fontWeight: 900, color: "#f0f0e8", fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-3px" }}>baza</div>
      <div style={{ fontSize: 15, color: "#4caf7d", fontFamily: "monospace", letterSpacing: "0.1em" }}>.ng</div>
      <div style={{ marginTop: 48, fontSize: 12, color: "#2a4a2a", fontFamily: "monospace", letterSpacing: "0.2em", animation: "pulse 1.5s infinite" }}>
        Good evening, Thrive ☀️
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
      `}</style>
    </div>
  );
}

function IntentGate({ onSelect }) {
  const modes = [
    { key: "stockup",  emoji: "🏠", title: "Stock up the house", desc: "Bundles for the week or month", color: "#4caf7d" },
    { key: "tonight",  emoji: "🍳", title: "Cook a meal", desc: "Meal packs for any time of day", color: "#f5a623" },
    { key: "readyeat", emoji: "🥡", title: "Ready to eat", desc: "Hot food, delivered now", color: "#e85c3a" },
    { key: "quickies", emoji: "⚡", title: "Quickies", desc: "Bread, smoothies, eggrolls & more", color: "#c77dff" },
    { key: "restock",  emoji: "🔍", title: "I just need one thing", desc: "Search and grab. Quick.", color: "#6ec6ff" },
    { key: "chat",     emoji: "💬", title: "Help me decide", desc: "Chat with our assistant", color: "#ff7043" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", background: "#080f09", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ padding: "52px 24px 24px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#2a4a2a", marginBottom: 10 }}>6:42 PM · LAGOS</div>
        <div style={{ fontSize: 28, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px", lineHeight: 1.2 }}>What are we<br />doing today?</div>
      </div>
      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", paddingBottom: 24 }}>
        {modes.map((m, i) => (
          <button key={m.key} onClick={() => onSelect(m.key)} style={{
            background: "#0d1a0f", border: "1px solid #1a2a1c",
            padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
            cursor: "pointer", textAlign: "left",
            animation: `fadeUp 0.35s ${i * 0.07}s both`
          }}>
            <div style={{
              width: 44, height: 44, background: `${m.color}12`, border: `1px solid ${m.color}22`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
            }}>{m.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}>{m.title}</div>
              <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.15em", marginTop: 4 }}>{m.desc.toUpperCase()}</div>
            </div>
            <span style={{ color: m.color, fontSize: 18, opacity: 0.4 }}>›</span>
          </button>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── BUNDLE DETAIL (editable) ──────────────────────────────────────────────────
function BundleDetail({ bundle, onBack, onAddToCart }) {
  const [items, setItems] = useState(bundle.items.map(i => ({ ...i })));
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const memberTotal = Math.round(total * (1 - bundle.savings / 100));
  const activeItems = items.filter(i => i.qty > 0);

  const setQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));

  return (
    <div style={{ width: "100%", height: "100%", background: bundle.bg, display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      {/* Header */}
      <div style={{ padding: "52px 22px 18px", borderBottom: `1px solid ${bundle.color}18` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: bundle.color, fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 14, padding: 0, opacity: 0.7 }}>← BUNDLES</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 36 }}>{bundle.emoji}</span>
          <div>
            <div style={{ fontSize: 22, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.8px" }}>{bundle.name}</div>
            <div style={{ fontSize: 9, color: bundle.color, letterSpacing: "0.2em", marginTop: 4 }}>SAVE {bundle.savings}% AS MEMBER</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#3a5a3a", marginTop: 10, letterSpacing: "0.05em", lineHeight: 1.6 }}>{bundle.desc}</div>
      </div>

      {/* Items list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#2a3a2a", marginBottom: 4, paddingTop: 12 }}>ADJUST QUANTITIES</div>
        {items.map((item) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 0", borderBottom: `1px solid ${bundle.color}0f`,
            opacity: item.qty === 0 ? 0.35 : 1, transition: "opacity 0.2s"
          }}>
            <span style={{ fontSize: 20, width: 28 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#d0e0d0", letterSpacing: "-0.2px" }}>{item.name}</div>
              <div style={{ fontSize: 9, color: "#3a5a3a", marginTop: 2 }}>{fmt(item.unitPrice)} each</div>
            </div>
            <QtyControl
              value={item.qty} min={item.min} max={item.max}
              onChange={(v) => setQty(item.id, v)} color={bundle.color} size="small"
            />
          </div>
        ))}
        {activeItems.length === 0 && (
          <div style={{ fontSize: 10, color: "#1a2a1a", textAlign: "center", padding: "20px 0", letterSpacing: "0.2em" }}>
            ALL ITEMS REMOVED. ADD AT LEAST ONE.
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 22px 40px", borderTop: `1px solid ${bundle.color}18` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 9, color: "#2a3a2a", letterSpacing: "0.2em" }}>
          <span>RETAIL VALUE</span>
          <span style={{ textDecoration: "line-through", color: "#2a3a2a" }}>{fmt(total)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, letterSpacing: "0.1em" }}>
          <span style={{ color: bundle.color }}>MEMBER PRICE</span>
          <span style={{ color: "#f0f0e8", fontWeight: 700 }}>{fmt(memberTotal)}</span>
        </div>
        <button
          disabled={activeItems.length === 0}
          onClick={() => onAddToCart({ ...bundle, items, price: memberTotal, qty: 1, type: "bundle" })}
          style={{
            width: "100%", padding: "15px 0", fontFamily: "monospace",
            background: activeItems.length === 0 ? "#1a2a1a" : bundle.color,
            border: "none", color: activeItems.length === 0 ? "#2a3a2a" : "#000",
            fontSize: 11, letterSpacing: "0.3em", cursor: activeItems.length === 0 ? "default" : "pointer",
            fontWeight: 700, transition: "all 0.2s"
          }}>ADD TO CART · {activeItems.length} ITEMS</button>
      </div>
    </div>
  );
}

// ── STOCK UP ─────────────────────────────────────────────────────────────────
function StockUpMode({ cart, setCart, onBack }) {
  const [openBundle, setOpenBundle] = useState(null);
  const [added, setAdded] = useState([]);
  const bundles = Object.values(BUNDLE_CATALOG);

  const handleAdd = (bundle) => {
    setCart(c => [...c, bundle]);
    setAdded(a => [...a, bundle.id]);
    setOpenBundle(null);
  };

  if (openBundle) {
    return <BundleDetail bundle={openBundle} onBack={() => setOpenBundle(null)} onAddToCart={handleAdd} />;
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "#070e08", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ padding: "52px 24px 16px", borderBottom: "1px solid #0f1a10" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5c3a", fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 12, padding: 0 }}>← BACK</button>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px" }}>Stock Up</div>
        <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.2em", marginTop: 4 }}>TAP A BUNDLE TO CUSTOMISE IT</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
        {bundles.map((b, i) => (
          <button key={b.id} onClick={() => setOpenBundle(b)} style={{
            background: b.bg, border: `1px solid ${b.color}22`,
            padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
            cursor: "pointer", textAlign: "left", animation: `fadeUp 0.3s ${i * 0.07}s both`
          }}>
            <div style={{ fontSize: 30 }}>{b.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}>{b.name}</div>
              <div style={{ fontSize: 9, color: b.color, marginTop: 3, letterSpacing: "0.15em" }}>{b.items.length} ITEMS · SAVE {b.savings}%</div>
              <div style={{ fontSize: 10, color: "#3a5a3a", marginTop: 4 }}>{b.desc}</div>
            </div>
            <div style={{ textAlign: "right", minWidth: 70 }}>
              <div style={{ fontSize: 13, color: "#f0f0e8" }}>{fmt(b.basePrice)}</div>
              {added.includes(b.id) && <div style={{ fontSize: 8, color: "#4caf7d", marginTop: 4, letterSpacing: "0.15em" }}>✓ IN CART</div>}
              {!added.includes(b.id) && <div style={{ fontSize: 9, color: b.color, marginTop: 4, letterSpacing: "0.1em" }}>Customise ›</div>}
            </div>
          </button>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── MEAL PACK DETAIL (adjustable plates) ─────────────────────────────────────
function MealPackDetail({ pack, onBack, onAdd }) {
  const [plates, setPlates] = useState(pack.basePlates);
  const ratio = plates / pack.basePlates;
  const price = Math.round(pack.basePrice * ratio);
  const time = pack.baseTime;

  return (
    <div style={{ width: "100%", height: "100%", background: pack.bg, display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      {/* Hero */}
      <div style={{
        height: 200, display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(135deg, ${pack.bg}, ${pack.color}18)`,
        position: "relative"
      }}>
        <div style={{ fontSize: 80 }}>{pack.emoji}</div>
        <button onClick={onBack} style={{
          position: "absolute", top: 52, left: 20, background: "rgba(0,0,0,0.5)",
          border: "1px solid #333", color: "#aaa", fontSize: 10,
          letterSpacing: "0.2em", padding: "7px 14px", cursor: "pointer"
        }}>← BACK</button>
      </div>

      {/* Info */}
      <div style={{ padding: "18px 22px 0" }}>
        <div style={{ fontSize: 9, color: pack.color, letterSpacing: "0.3em", marginBottom: 6 }}>{time} MIN COOK TIME</div>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px", marginBottom: 6 }}>{pack.name}</div>
        <div style={{ fontSize: 11, color: "#5a7a5a", lineHeight: 1.6 }}>{pack.desc}</div>

        {/* Plate selector */}
        <div style={{
          marginTop: 18, padding: "14px 16px",
          background: `${pack.color}0e`, border: `1px solid ${pack.color}22`,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: 10, color: pack.color, letterSpacing: "0.2em", marginBottom: 2 }}>PLATES / SERVINGS</div>
            <div style={{ fontSize: 10, color: "#3a5a3a" }}>All ingredients scale automatically</div>
          </div>
          <QtyControl value={plates} min={1} max={12} onChange={setPlates} color={pack.color} />
        </div>
      </div>

      {/* Ingredients */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#2a3a2a", marginBottom: 8 }}>WHAT'S INSIDE FOR {plates} PLATE{plates > 1 ? "S" : ""}</div>
        {pack.items.map((item, i) => {
          const scaled = (item.perPlate * plates);
          const display = scaled % 1 === 0 ? scaled : scaled.toFixed(1);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${pack.color}0a` }}>
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              <span style={{ flex: 1, fontSize: 11, color: "#9ab09b" }}>{item.name}</span>
              <span style={{ fontSize: 11, color: pack.color, fontFamily: "monospace" }}>{display} {item.unit}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 22px 40px", borderTop: `1px solid ${pack.color}18` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "#2a3a2a", letterSpacing: "0.2em" }}>TOTAL FOR {plates} PLATE{plates > 1 ? "S" : ""}</div>
            <div style={{ fontSize: 9, color: "#3a5a3a", marginTop: 2, letterSpacing: "0.1em" }}>FREE DELIVERY · MEMBERS</div>
          </div>
          <div style={{ fontSize: 24, color: "#f0f0e8", fontWeight: 700 }}>{fmt(price)}</div>
        </div>
        <button onClick={() => onAdd({ ...pack, plates, price, qty: 1, type: "mealpack" })} style={{
          width: "100%", padding: "15px 0", background: pack.color, border: "none",
          color: "#000", fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace",
          cursor: "pointer", fontWeight: 700
        }}>ADD TO CART · {plates} PLATE{plates > 1 ? "S" : ""}</button>
      </div>
    </div>
  );
}


// ── DATA: READY TO EAT ────────────────────────────────────────────────────────
const READY_EAT = [
  {
    id: "re1", name: "Jollof Rice + Chicken", kitchen: "Mama Titi's Kitchen",
    emoji: "🍛", price: 3800, oldPrice: 4500, time: "20–35 min",
    tags: ["Bestseller", "Spicy available"], color: "#e85c3a", bg: "#1a0600",
    desc: "Party jollof, smoky and rich. Comes with a full chicken leg."
  },
  {
    id: "re2", name: "Egusi + Eba", kitchen: "Iya Beji Buka",
    emoji: "🥣", price: 3200, oldPrice: null, time: "15–25 min",
    tags: ["Homestyle", "No MSG"], color: "#f5a623", bg: "#1a0e00",
    desc: "Traditional egusi with fresh pumpkin leaves. Eba included."
  },
  {
    id: "re3", name: "Peppered Snail", kitchen: "Chop Life Lagos",
    emoji: "🐌", price: 5400, oldPrice: 6000, time: "25–40 min",
    tags: ["Premium", "Weekend special"], color: "#c77dff", bg: "#0f001a",
    desc: "Full pepper sauce, grilled finish. Comes with sliced bread."
  },
  {
    id: "re4", name: "Fried Rice + Moi Moi", kitchen: "Madam Kemi",
    emoji: "🍳", price: 3500, oldPrice: null, time: "20–30 min",
    tags: ["Family favourite"], color: "#ffe082", bg: "#1a1600",
    desc: "Golden fried rice with two wraps of moi moi. Pure comfort."
  },
  {
    id: "re5", name: "Suya Platter (500g)", kitchen: "Mallam Sule Suya",
    emoji: "🍢", price: 4200, oldPrice: 5000, time: "15–20 min",
    tags: ["Grilled fresh", "Comes with onions"], color: "#e85c3a", bg: "#1a0800",
    desc: "Beef and chicken suya. Served with sliced onion and groundnut."
  },
  {
    id: "re6", name: "Amala + Gbegiri + Ewedu", kitchen: "Iya Beji Buka",
    emoji: "🫙", price: 2900, oldPrice: null, time: "10–20 min",
    tags: ["Classic Lagos", "Quick"], color: "#4caf7d", bg: "#001a08",
    desc: "Abula in full effect. The combo that never misses."
  },
];

// ── DATA: QUICKIES ────────────────────────────────────────────────────────────
const QUICKIES = [
  {
    id: "q1", name: "Egg Roll × 2", emoji: "🥚", price: 800, category: "Snacks",
    tag: "Hot & fresh", color: "#f5a623"
  },
  {
    id: "q2", name: "Agege Bread (sliced)", emoji: "🍞", price: 650, category: "Breads",
    tag: "Baked today", color: "#c8843a"
  },
  {
    id: "q3", name: "Strawberry Smoothie 500ml", emoji: "🍓", price: 1800, category: "Drinks",
    tag: "No sugar added", color: "#e85c3a"
  },
  {
    id: "q4", name: "Green Smoothie 500ml", emoji: "🥦", price: 1900, category: "Drinks",
    tag: "Spinach, cucumber, apple", color: "#4caf7d"
  },
  {
    id: "q5", name: "Puff Puff × 6", emoji: "🟡", price: 600, category: "Snacks",
    tag: "Warm", color: "#f5a623"
  },
  {
    id: "q6", name: "Scotch Egg × 2", emoji: "🥚", price: 1100, category: "Snacks",
    tag: "Freshly made", color: "#c8843a"
  },
  {
    id: "q7", name: "Banana Bread slice", emoji: "🍌", price: 750, category: "Breads",
    tag: "Homemade", color: "#ffe082"
  },
  {
    id: "q8", name: "Mango Lassi 350ml", emoji: "🥭", price: 1600, category: "Drinks",
    tag: "Chilled", color: "#f5a623"
  },
  {
    id: "q9", name: "Meat Pie × 2", emoji: "🫓", price: 1200, category: "Snacks",
    tag: "Just out the oven", color: "#c8843a"
  },
  {
    id: "q10", name: "Coconut Bread (half loaf)", emoji: "🥥", price: 900, category: "Breads",
    tag: "Soft & sweet", color: "#ffe082"
  },
  {
    id: "q11", name: "Zobo Drink 500ml", emoji: "🍷", price: 700, category: "Drinks",
    tag: "Cold, no preservatives", color: "#e85c3a"
  },
  {
    id: "q12", name: "Chin Chin 200g", emoji: "🟤", price: 550, category: "Snacks",
    tag: "Crunchy", color: "#c8843a"
  },
];

const QUICKIE_CATS = ["All", "Snacks", "Breads", "Drinks"];

// ── READY TO EAT MODE ─────────────────────────────────────────────────────────
function ReadyEatMode({ cart, setCart, onBack }) {
  const [selected, setSelected] = useState(null);
  const [added, setAdded] = useState([]);

  const addItem = (item) => {
    setCart(c => [...c, { ...item, qty: 1, type: "readyeat" }]);
    setAdded(a => [...a, item.id]);
  };

  if (selected) {
    const item = selected;
    return (
      <div style={{ width:"100%",height:"100%",background:item.bg,display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
        {/* Hero */}
        <div style={{ height:220,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg,${item.bg},${item.color}1a)`,position:"relative" }}>
          <div style={{ fontSize:90 }}>{item.emoji}</div>
          <button onClick={()=>setSelected(null)} style={{ position:"absolute",top:52,left:20,background:"rgba(0,0,0,0.5)",border:"1px solid #333",color:"#aaa",fontSize:10,letterSpacing:"0.2em",padding:"7px 14px",cursor:"pointer" }}>← BACK</button>
          <div style={{ position:"absolute",top:52,right:20,background:`${item.color}22`,border:`1px solid ${item.color}44`,padding:"6px 12px" }}>
            <div style={{ fontSize:9,color:item.color,letterSpacing:"0.2em" }}>🕐 {item.time}</div>
          </div>
        </div>

        <div style={{ flex:1,padding:"20px 22px 0",overflowY:"auto" }}>
          <div style={{ fontSize:9,color:item.color,letterSpacing:"0.3em",marginBottom:6 }}>{item.kitchen.toUpperCase()}</div>
          <div style={{ fontSize:24,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-0.8px",marginBottom:8 }}>{item.name}</div>
          <div style={{ fontSize:12,color:"#5a7a5a",lineHeight:1.7,marginBottom:16 }}>{item.desc}</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:20 }}>
            {item.tags.map(t=>(
              <span key={t} style={{ fontSize:9,color:item.color,border:`1px solid ${item.color}44`,padding:"4px 10px",letterSpacing:"0.1em" }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ padding:"16px 22px 44px",borderTop:`1px solid ${item.color}18` }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div>
              {item.oldPrice && <div style={{ fontSize:10,color:"#2a3a2a",textDecoration:"line-through",letterSpacing:"0.05em" }}>{fmt(item.oldPrice)}</div>}
              <div style={{ fontSize:26,color:"#f0f0e8",fontWeight:700,fontFamily:"monospace" }}>{fmt(item.price)}</div>
            </div>
            <div style={{ fontSize:9,color:"#3a5c3a",letterSpacing:"0.15em" }}>FREE DELIVERY · MEMBERS</div>
          </div>
          <button onClick={()=>{addItem(item);setSelected(null);}} style={{
            width:"100%",padding:"15px",background:added.includes(item.id)?item.bg:item.color,
            border:added.includes(item.id)?`1px solid ${item.color}55`:"none",
            color:added.includes(item.id)?item.color:"#000",
            fontSize:11,letterSpacing:"0.3em",fontFamily:"monospace",cursor:"pointer",fontWeight:700
          }}>{added.includes(item.id)?"✓ ADDED TO CART":"ORDER THIS"}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width:"100%",height:"100%",background:"#0a0600",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"52px 24px 16px",borderBottom:"1px solid #1a0a00" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#7a3a1a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:12,padding:0 }}>← BACK</button>
        <div style={{ fontSize:26,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Ready to Eat</div>
        <div style={{ fontSize:9,color:"#4a2a1a",letterSpacing:"0.2em",marginTop:4 }}>HOT FOOD · DELIVERED FAST · FROM LOCAL KITCHENS</div>
      </div>

      <div style={{ flex:1,overflowY:"auto",padding:"14px 20px 80px",display:"flex",flexDirection:"column",gap:10 }}>
        {READY_EAT.map((item,i)=>(
          <button key={item.id} onClick={()=>setSelected(item)} style={{
            background:item.bg,border:`1px solid ${item.color}22`,
            padding:"16px 18px",display:"flex",alignItems:"center",gap:16,
            cursor:"pointer",textAlign:"left",
            animation:`fadeUp 0.3s ${i*0.06}s both`
          }}>
            <div style={{ fontSize:36,width:50,textAlign:"center" }}>{item.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9,color:item.color,letterSpacing:"0.2em",marginBottom:4 }}>{item.kitchen.toUpperCase()}</div>
              <div style={{ fontSize:14,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-0.5px" }}>{item.name}</div>
              <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap" }}>
                <span style={{ fontSize:9,color:"#4a3a2a",letterSpacing:"0.1em" }}>🕐 {item.time}</span>
                {item.tags.slice(0,1).map(t=><span key={t} style={{ fontSize:9,color:item.color,letterSpacing:"0.1em" }}>· {t}</span>)}
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              {item.oldPrice && <div style={{ fontSize:9,color:"#3a2a1a",textDecoration:"line-through" }}>{fmt(item.oldPrice)}</div>}
              <div style={{ fontSize:14,color:"#f0f0e8",fontWeight:700 }}>{fmt(item.price)}</div>
              {added.includes(item.id) && <div style={{ fontSize:8,color:"#4caf7d",marginTop:4,letterSpacing:"0.15em" }}>✓ ADDED</div>}
            </div>
          </button>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── QUICKIES MODE ─────────────────────────────────────────────────────────────
function QuickiesMode({ cart, setCart, onBack }) {
  const [activeCat, setActiveCat] = useState("All");
  const [itemQtys, setItemQtys] = useState({});

  const filtered = activeCat === "All" ? QUICKIES : QUICKIES.filter(q=>q.category===activeCat);
  const getQty = (id) => itemQtys[id] ?? 0;

  const setQty = (item, newQty) => {
    const clamped = Math.max(0, Math.min(20, newQty));
    setItemQtys(q=>({...q,[item.id]:clamped}));
    setCart(prev=>{
      const exists = prev.find(c=>c.id===item.id);
      if (clamped===0) return prev.filter(c=>c.id!==item.id);
      if (exists) return prev.map(c=>c.id===item.id?{...c,qty:clamped,price:item.price*clamped}:c);
      return [...prev,{...item,qty:clamped,price:item.price*clamped,type:"quickie"}];
    });
  };

  return (
    <div style={{ width:"100%",height:"100%",background:"#0c0714",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"52px 24px 16px" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#6a3a9a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:12,padding:0 }}>← BACK</button>
        <div style={{ fontSize:26,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Quickies</div>
        <div style={{ fontSize:9,color:"#3a1a5a",letterSpacing:"0.2em",marginTop:4 }}>IMPULSE BUYS · GRAB & GO</div>
      </div>

      {/* Category filter */}
      <div style={{ display:"flex",gap:8,padding:"0 20px 14px",overflowX:"auto" }}>
        {QUICKIE_CATS.map(cat=>(
          <button key={cat} onClick={()=>setActiveCat(cat)} style={{
            whiteSpace:"nowrap",padding:"7px 16px",
            background:activeCat===cat?"#c77dff22":"transparent",
            border:activeCat===cat?"1px solid #c77dff66":"1px solid #1a0a2a",
            color:activeCat===cat?"#c77dff":"#4a2a6a",
            fontSize:9,letterSpacing:"0.2em",cursor:"pointer",fontFamily:"monospace",
            transition:"all 0.15s"
          }}>{cat.toUpperCase()}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex:1,overflowY:"auto",padding:"0 16px 80px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {filtered.map((item,i)=>{
            const qty = getQty(item.id);
            const inCart = qty > 0;
            return (
              <div key={item.id} style={{
                background:"#100818",border:`1px solid ${inCart?item.color+"44":"#1a0a2a"}`,
                padding:"14px 12px",display:"flex",flexDirection:"column",gap:8,
                transition:"border-color 0.2s",
                animation:`fadeUp 0.25s ${i*0.04}s both`
              }}>
                <span style={{ fontSize:28 }}>{item.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,color:"#e0d0f0",lineHeight:1.3 }}>{item.name}</div>
                  <div style={{ fontSize:8,color:item.color,marginTop:4,letterSpacing:"0.15em" }}>{item.tag.toUpperCase()}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ fontSize:13,color:"#f0f0e8",fontWeight:700 }}>{fmt(item.price)}</div>
                  {/* ADD → stepper transform */}
                  {!inCart ? (
                    <button onClick={()=>setQty(item,1)} style={{
                      padding:"6px 14px",background:"transparent",
                      border:`1px solid ${item.color}55`,color:item.color,
                      fontSize:9,letterSpacing:"0.15em",cursor:"pointer",fontFamily:"monospace"
                    }}>ADD</button>
                  ) : (
                    <div style={{ display:"flex",alignItems:"center",border:`1px solid ${item.color}44`,overflow:"hidden" }}>
                      <button onClick={()=>setQty(item,qty-1)} style={{
                        width:26,height:26,background:qty===1?"#2a0a0a":"#1a0a2a",
                        border:"none",color:qty===1?"#e85c3a":item.color,
                        fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"
                      }}>{qty===1?"×":"−"}</button>
                      <span style={{ minWidth:22,textAlign:"center",fontSize:12,color:"#f0f0e8",background:"#0c0714",lineHeight:"26px" }}>{qty}</span>
                      <button onClick={()=>setQty(item,qty+1)} style={{
                        width:26,height:26,background:"#1a0a2a",
                        border:"none",color:item.color,
                        fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"
                      }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── TONIGHT MODE ──────────────────────────────────────────────────────────────
function TonightMode({ cart, setCart, onBack }) {
  const [selected, setSelected] = useState(null);
  const [added, setAdded] = useState([]);

  const handleAdd = (item) => {
    setCart(c => [...c, item]);
    setAdded(a => [...a, item.id]);
    setSelected(null);
  };

  if (selected) return <MealPackDetail pack={selected} onBack={() => setSelected(null)} onAdd={handleAdd} />;

  return (
    <div style={{ width: "100%", height: "100%", background: "#080a04", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ padding: "52px 24px 16px", borderBottom: "1px solid #0f1a08" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#7a8a4a", fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 12, padding: 0 }}>← BACK</button>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px" }}>Cook a meal</div>
        <div style={{ fontSize: 9, color: "#4a6a2a", letterSpacing: "0.2em", marginTop: 4 }}>CHOOSE A MEAL PACK · SET YOUR PLATES</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
        {MEAL_PACKS.map((m, i) => (
          <button key={m.id} onClick={() => setSelected(m)} style={{
            background: m.bg, border: `1px solid ${m.color}22`,
            padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
            cursor: "pointer", textAlign: "left", animation: `fadeUp 0.3s ${i * 0.07}s both`
          }}>
            <div style={{ fontSize: 32 }}>{m.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}>{m.name}</div>
              <div style={{ fontSize: 9, color: m.color, marginTop: 3, letterSpacing: "0.15em" }}>{m.baseTime} MIN · {m.basePlates} PLATES BASE</div>
              <div style={{ fontSize: 10, color: "#4a6a3a", marginTop: 4 }}>{m.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#f0f0e8" }}>{fmt(m.basePrice)}</div>
              {added.includes(m.id) && <div style={{ fontSize: 8, color: "#4caf7d", marginTop: 4, letterSpacing: "0.15em" }}>✓ ADDED</div>}
            </div>
          </button>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── RESTOCK MODE ─────────────────────────────────────────────────────────────
// UX pattern: ADD button transforms into − qty + stepper after first tap.
// No separate quantity control + add button coexisting — one control, two states.
function RestockMode({ cart, setCart, onBack }) {
  const [query, setQuery] = useState("");
  // itemQtys: { [id]: number } — tracks qty for items in cart
  const [itemQtys, setItemQtys] = useState({});

  const filtered = query
    ? RESTOCK_ITEMS.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.brand.toLowerCase().includes(query.toLowerCase()))
    : RESTOCK_ITEMS;

  const getQty = (id) => itemQtys[id] ?? 0;

  const setQty = (item, newQty) => {
    const clamped = clamp(newQty, 0, 20);
    setItemQtys(q => ({ ...q, [item.id]: clamped }));

    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (clamped === 0) return prev.filter(c => c.id !== item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: clamped, price: item.price * clamped } : c);
      return [...prev, { ...item, qty: clamped, price: item.price * clamped, type: "item" }];
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#070a12", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ padding: "52px 20px 14px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5a8a", fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 12, padding: 0 }}>← BACK</button>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px", marginBottom: 14 }}>Quick Restock</div>
        <div style={{ background: "#0d1220", border: "1px solid #1a2540", display: "flex", alignItems: "center", padding: "11px 16px", gap: 10 }}>
          <span style={{ fontSize: 14, color: "#3a5a8a" }}>⌕</span>
          <input
            autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="What do you need?"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#c8d8f0", fontSize: 13, fontFamily: "monospace" }}
          />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "#3a5a8a", cursor: "pointer", fontSize: 16 }}>×</button>}
        </div>
        <div style={{ fontSize: 9, color: "#1a2a3a", letterSpacing: "0.15em", marginTop: 8 }}>
          EACH SIZE IS ITS OWN PRODUCT — PICK THE ONE YOU WANT
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ color: "#1a2a3a", fontSize: 11, letterSpacing: "0.2em", textAlign: "center", paddingTop: 40 }}>NOT IN STOCK YET.</div>
        ) : filtered.map((item, i) => {
          const qty = getQty(item.id);
          const inCart = qty > 0;
          return (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "15px 0", borderBottom: "1px solid #0d1220",
              animation: `fadeUp 0.2s ${i * 0.04}s both`
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                background: "#0d1220", border: `1px solid ${inCart ? "#6ec6ff33" : "#1a2540"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, transition: "border-color 0.2s"
              }}>{item.emoji}</div>

              {/* Name + brand */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: inCart ? "#f0f0e8" : "#c8d8f0", lineHeight: 1.3, transition: "color 0.2s" }}>{item.name}</div>
                <div style={{ fontSize: 9, color: "#2a4060", marginTop: 3, letterSpacing: "0.15em" }}>{item.brand.toUpperCase()}</div>
                {inCart && (
                  <div style={{ fontSize: 9, color: "#6ec6ff", marginTop: 3, letterSpacing: "0.1em" }}>
                    {fmt(item.price * qty)} total
                  </div>
                )}
              </div>

              {/* Right: price + action */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: "#f0f0e8", fontFamily: "monospace" }}>{fmt(item.price)}</span>

                {/* THE KEY UX: ADD → transforms to stepper */}
                {!inCart ? (
                  <button
                    onClick={() => setQty(item, 1)}
                    style={{
                      padding: "7px 18px", background: "transparent",
                      border: "1px solid #6ec6ff55", color: "#6ec6ff",
                      fontSize: 10, letterSpacing: "0.2em", cursor: "pointer",
                      fontFamily: "monospace", transition: "all 0.15s"
                    }}
                  >ADD</button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #6ec6ff44", overflow: "hidden" }}>
                    <button
                      onClick={() => setQty(item, qty - 1)}
                      style={{
                        width: 32, height: 30, background: qty === 1 ? "#1a0a0a" : "#0d1a2a",
                        border: "none", color: qty === 1 ? "#e85c3a" : "#6ec6ff",
                        fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >{qty === 1 ? "×" : "−"}</button>
                    <span style={{
                      minWidth: 28, textAlign: "center",
                      fontSize: 13, color: "#f0f0e8", fontFamily: "monospace",
                      background: "#0d1220", padding: "0 4px", lineHeight: "30px"
                    }}>{qty}</span>
                    <button
                      onClick={() => setQty(item, qty + 1)}
                      style={{
                        width: 32, height: 30, background: "#0d1a2a",
                        border: "none", color: "#6ec6ff",
                        fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── CHAT ─────────────────────────────────────────────────────────────────────
function ChatMode({ cart, setCart, onBack }) {
  const [messages, setMessages] = useState([{ from: "baza", text: "Hey! 👋 What are we doing today? Cooking, restocking, or still figuring it out?" }]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [packAdded, setPackAdded] = useState(false);
  const bottomRef = useRef(null);

  const botReplies = [
    { triggers: ["cook", "eat", "dinner", "tonight", "food", "meal", "hungry"], reply: "Nice. How many plates are you cooking for?", next: 1 },
    { triggers: ["1","2","3","4","5","6","one","two","three","four","five","six","family","us"], reply: "Got it. For that size I'd suggest the Egusi Soup Pack or the Jollof Pack. Both are complete — nothing missing. Which sounds better tonight?", next: 2 },
    { triggers: ["egusi","soup","that","first","yes"], reply: "Perfect. I've added the Egusi Soup Pack to your cart, scaled for your plates. Want eba to go with it? ₦800 for 1kg.", next: 3 },
    { triggers: ["yes","yeah","add","eba","sure","ok"], reply: "Done — Egusi Pack + Eba. Free delivery tomorrow by 10am, or tonight by 9pm for ₦800 extra. Which works?", next: 4 },
    { triggers: ["tonight","now","9","fast","asap","tomorrow","morning","free"], reply: "Sorted! 🎉 You'll get a WhatsApp confirmation once a rider picks it up. Anything else?", next: 5 },
  ];

  const send = (text = input) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: "user", text }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      const match = botReplies.find(r => r.triggers.some(t => lower.includes(t)));
      if (match) {
        setMessages(m => [...m, { from: "baza", text: match.reply }]);
        setStep(match.next);
        if (match.next === 3 && !packAdded) {
          setCart(c => [...c, { ...MEAL_PACKS[1], price: MEAL_PACKS[1].basePrice, qty: 1, type: "mealpack" }]);
          setPackAdded(true);
        }
      } else {
        setMessages(m => [...m, { from: "baza", text: "Let me check what we have for that. One sec." }]);
      }
      setTyping(false);
    }, 900 + Math.random() * 500);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const quickReplies = [
    step === 0 && ["Cooking tonight", "Restock the house", "Just browsing"],
    step === 1 && ["Just me", "2 people", "4 people", "Family (6+)"],
    step === 2 && ["Egusi Pack", "Jollof Pack", "Show me more"],
    step === 3 && ["Yes, add eba", "No thanks"],
    step === 4 && ["Tonight (₦800)", "Tomorrow (Free)"],
  ].find(Boolean) || [];

  return (
    <div style={{ width: "100%", height: "100%", background: "#080a0f", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ padding: "52px 20px 14px", borderBottom: "1px solid #0f1220", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#ff7043", fontSize: 11, cursor: "pointer", padding: 0 }}>←</button>
        <div style={{ width: 34, height: 34, background: "#ff704322", border: "1px solid #ff704333", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛍️</div>
        <div>
          <div style={{ fontSize: 13, color: "#f0f0e8" }}>Baza Assistant</div>
          <div style={{ fontSize: 9, color: "#ff7043", letterSpacing: "0.2em" }}>● ONLINE</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "10px 14px",
              background: msg.from === "user" ? "#ff704322" : "#0d1220",
              border: msg.from === "user" ? "1px solid #ff704333" : "1px solid #1a2540",
              fontSize: 12, color: "#d0d8e0", lineHeight: 1.6
            }}>{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "#0d1220", border: "1px solid #1a2540", width: 56 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, background: "#3a5a8a", borderRadius: "50%", animation: `bounce 1s ${i*0.15}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {quickReplies.length > 0 && (
        <div style={{ padding: "8px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
          {quickReplies.map(r => (
            <button key={r} onClick={() => send(r)} style={{ whiteSpace: "nowrap", padding: "7px 14px", background: "transparent", border: "1px solid #1a2a40", color: "#6ec6ff", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}>{r}</button>
          ))}
        </div>
      )}
      <div style={{ padding: "10px 16px 36px", display: "flex", gap: 10, borderTop: "1px solid #0f1220" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type anything..."
          style={{ flex: 1, background: "#0d1220", border: "1px solid #1a2540", padding: "11px 14px", color: "#c8d8f0", fontSize: 12, fontFamily: "monospace", outline: "none" }}
        />
        <button onClick={() => send()} style={{ padding: "11px 16px", background: "#ff7043", border: "none", color: "#000", fontSize: 14, cursor: "pointer" }}>↑</button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── FUND WALLET PROMPT (modal overlay) ───────────────────────────────────────
function FundPrompt({ shortfall, accountNumber, onFund, onDismiss }) {
  const [selected, setSelected] = useState(null);
  const amounts = [5000, 10000, 20000, 50000];
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end"
    }}>
      <div style={{
        background: "#080f09", borderTop: "1px solid #1a2a1c",
        borderRadius: "20px 20px 0 0", padding: "28px 24px 48px",
        fontFamily: "monospace"
      }}>
        <div style={{ width: 36, height: 4, background: "#1a2a1c", borderRadius: 2, margin: "0 auto 24px" }} />

        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#e85c3a", marginBottom: 8 }}>INSUFFICIENT BALANCE</div>
        <div style={{ fontSize: 22, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.8px", marginBottom: 6 }}>
          Top up to complete
        </div>
        <div style={{ fontSize: 11, color: "#3a5c3a", marginBottom: 24, lineHeight: 1.6 }}>
          You need at least <span style={{ color: "#f5a623" }}>{fmt(shortfall)}</span> more.<br />
          Transfer to your Baza wallet to proceed.
        </div>

        {/* Account details */}
        <div style={{
          background: "#0d1a0f", border: "1px solid #1a2a1c",
          padding: "14px 16px", marginBottom: 20
        }}>
          <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.25em", marginBottom: 8 }}>YOUR BAZA ACCOUNT</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 18, color: "#f0f0e8", letterSpacing: "0.1em", fontWeight: 700 }}>{accountNumber}</div>
              <div style={{ fontSize: 9, color: "#3a5c3a", marginTop: 4, letterSpacing: "0.15em" }}>PROVIDUS BANK · BAZA NG LTD</div>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(accountNumber)}
              style={{ background: "none", border: "1px solid #1a2a1c", color: "#4caf7d", fontSize: 9, letterSpacing: "0.2em", padding: "6px 12px", cursor: "pointer" }}
            >COPY</button>
          </div>
        </div>

        {/* Quick top-up amounts */}
        <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.25em", marginBottom: 12 }}>QUICK TOP-UP</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {amounts.map(a => (
            <button key={a} onClick={() => setSelected(a)} style={{
              padding: "12px 0", background: selected === a ? "#4caf7d18" : "transparent",
              border: selected === a ? "1px solid #4caf7d66" : "1px solid #1a2a1c",
              color: selected === a ? "#4caf7d" : "#6a8a6a",
              fontSize: 12, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "monospace"
            }}>{fmt(a)}</button>
          ))}
        </div>

        <button
          onClick={() => selected && onFund(selected)}
          style={{
            width: "100%", padding: "15px 0", marginBottom: 12,
            background: selected ? "#4caf7d" : "#1a2a1c",
            border: "none", color: selected ? "#000" : "#2a3a2a",
            fontSize: 11, letterSpacing: "0.3em", fontFamily: "monospace",
            cursor: selected ? "pointer" : "default", fontWeight: 700,
            transition: "all 0.2s"
          }}
        >{selected ? `ADD ${fmt(selected)} TO WALLET` : "SELECT AN AMOUNT"}</button>

        <button onClick={onDismiss} style={{
          width: "100%", padding: "12px 0", background: "transparent",
          border: "none", color: "#2a3a2a", fontSize: 10, letterSpacing: "0.2em",
          cursor: "pointer", fontFamily: "monospace"
        }}>CANCEL</button>
      </div>
    </div>
  );
}

// ── CART ─────────────────────────────────────────────────────────────────────
function CartScreen({ cart, setCart, balance, setBalance, accountNumber, setOrders, onBack, onGoProfile }) {
  const [done, setDone] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const total = cart.reduce((a, i) => a + (i.price || 0), 0);
  const hasFunds = balance >= total;
  const remove = (idx) => setCart(c => c.filter((_, j) => j !== idx));

  const handleConfirm = () => {
    if (!hasFunds) { setShowFund(true); return; }
    setBalance(b => b - total);
    setOrders(o => [{
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: "Today",
      items: cart,
      total,
      note: orderNote,
      status: "confirmed",
      eta: "Tomorrow by 10am"
    }, ...o]);
    setCart([]);
    setDone(true);
  };

  const handleFund = (amount) => {
    setBalance(b => b + amount);
    setShowFund(false);
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#050805", display: "flex", flexDirection: "column", fontFamily: "monospace", position: "relative" }}>
      <div style={{ padding: "52px 24px 16px", borderBottom: "1px solid #0a100a" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5c3a", fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 12, padding: 0 }}>← KEEP SHOPPING</button>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px" }}>Your Cart</div>
      </div>

      {/* Balance indicator */}
      {cart.length > 0 && (
        <div style={{
          margin: "12px 24px 0",
          padding: "10px 14px",
          background: hasFunds ? "#0a1a0c" : "#1a0a0a",
          border: `1px solid ${hasFunds ? "#4caf7d22" : "#e85c3a22"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: hasFunds ? "#2a4a2a" : "#4a1a1a" }}>WALLET BALANCE</div>
            <div style={{ fontSize: 14, color: hasFunds ? "#4caf7d" : "#e85c3a", marginTop: 2 }}>{fmt(balance)}</div>
          </div>
          {!hasFunds && (
            <button onClick={() => setShowFund(true)} style={{
              padding: "7px 14px", background: "transparent",
              border: "1px solid #e85c3a55", color: "#e85c3a",
              fontSize: 9, letterSpacing: "0.2em", cursor: "pointer"
            }}>TOP UP</button>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
        {cart.length === 0 && !done ? (
          <div style={{ color: "#1a2a1a", fontSize: 11, letterSpacing: "0.2em", textAlign: "center", paddingTop: 60 }}>CART IS EMPTY</div>
        ) : done ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
            <div style={{ fontSize: 14, color: "#4caf7d", letterSpacing: "0.2em", marginBottom: 8 }}>ORDER CONFIRMED</div>
            <div style={{ fontSize: 10, color: "#3a5c3a", letterSpacing: "0.15em" }}>ARRIVING TOMORROW BY 10AM</div>
            <button onClick={onBack} style={{
              marginTop: 32, padding: "12px 28px", background: "transparent",
              border: "1px solid #1a2a1c", color: "#4caf7d", fontSize: 10,
              letterSpacing: "0.2em", cursor: "pointer", fontFamily: "monospace"
            }}>BACK TO HOME</button>
          </div>
        ) : cart.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 0", borderBottom: "1px solid #0a100a" }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#d0e0d0" }}>{item.name}</div>
              <div style={{ fontSize: 9, color: "#2a3a2a", marginTop: 3, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {item.type === "bundle" ? `Bundle · ${item.items?.filter(x => x.qty > 0).length} items`
                  : item.type === "mealpack" ? `Meal Pack · ${item.plates || item.basePlates} plates`
                  : `×${item.qty}`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#f0f0e8" }}>{fmt(item.price)}</span>
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#2a3a2a", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && !done && (
        <div style={{ padding: "16px 24px 44px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 9, color: "#2a3a2a", letterSpacing: "0.2em" }}>
            <span>SUBTOTAL</span><span style={{ color: "#f0f0e8" }}>{fmt(total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 9, color: "#2a3a2a", letterSpacing: "0.2em" }}>
            <span>DELIVERY</span><span style={{ color: "#4caf7d" }}>FREE · MEMBERS</span>
          </div>
          {/* Order note */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:8,color:"#2a3a2a",letterSpacing:"0.2em",marginBottom:6 }}>NOTE FOR RIDER / KITCHEN <span style={{ color:"#1a2a1a" }}>(OPTIONAL)</span></div>
            <textarea
              value={orderNote} onChange={e=>setOrderNote(e.target.value)}
              placeholder="e.g. Leave at gate, call on arrival, no pepper..."
              rows={2}
              style={{ width:"100%",background:"#0a120a",border:"1px solid #1a2a1c",padding:"11px 14px",color:"#c0d8c0",fontSize:11,fontFamily:"monospace",outline:"none",resize:"none",lineHeight:1.6 }}
            />
          </div>

          <button onClick={handleConfirm} style={{
            width: "100%", padding: "16px", fontFamily: "monospace",
            background: hasFunds ? "#f0f0e8" : "#e85c3a",
            border: "none", color: "#000",
            fontSize: 11, letterSpacing: "0.3em", cursor: "pointer", fontWeight: 700
          }}>
            {hasFunds ? "CONFIRM WITH FACE ID" : `FUND WALLET · NEED ${fmt(total - balance)} MORE`}
          </button>
        </div>
      )}

      {showFund && (
        <FundPrompt
          shortfall={Math.max(0, total - balance)}
          accountNumber={accountNumber}
          onFund={handleFund}
          onDismiss={() => setShowFund(false)}
        />
      )}
    </div>
  );
}

// ── ORDERS SCREEN ─────────────────────────────────────────────────────────────
function OrdersScreen({ orders, onBack }) {
  const statusColor = { confirmed: "#4caf7d", delivered: "#3a5c3a", pending: "#f5a623" };
  return (
    <div style={{ width: "100%", height: "100%", background: "#050a06", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ padding: "52px 24px 16px", borderBottom: "1px solid #0a120a" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5c3a", fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 12, padding: 0 }}>← PROFILE</button>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px" }}>Orders</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px 40px" }}>
        {orders.length === 0 ? (
          <div style={{ color: "#1a2a1a", fontSize: 11, letterSpacing: "0.2em", textAlign: "center", paddingTop: 60, lineHeight: 2 }}>
            NO ORDERS YET.<br /><span style={{ color: "#0f1a0f" }}>YOUR HISTORY WILL APPEAR HERE.</span>
          </div>
        ) : orders.map((order, i) => (
          <div key={order.id} style={{
            background: "#0a120a", border: "1px solid #1a2a1c",
            padding: "16px", marginBottom: 10,
            animation: `fadeUp 0.3s ${i * 0.07}s both`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: "#f0f0e8", letterSpacing: "0.1em" }}>{order.id}</div>
                <div style={{ fontSize: 9, color: "#2a4a2a", marginTop: 3, letterSpacing: "0.15em" }}>{order.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: statusColor[order.status] || "#4caf7d", letterSpacing: "0.2em" }}>
                  ● {order.status.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: "#f0f0e8", marginTop: 4 }}>{fmt(order.total)}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #1a2a1c", paddingTop: 10 }}>
              {order.items.slice(0, 3).map((item, j) => (
                <div key={j} style={{ fontSize: 10, color: "#3a5c3a", marginBottom: 3, letterSpacing: "0.05em" }}>
                  {item.emoji} {item.name}
                </div>
              ))}
              {order.items.length > 3 && (
                <div style={{ fontSize: 9, color: "#2a4a2a", marginTop: 4, letterSpacing: "0.15em" }}>
                  +{order.items.length - 3} MORE ITEMS
                </div>
              )}
            </div>
            {order.note && (
              <div style={{ marginTop:8,padding:"8px 10px",background:"#050a06",border:"1px solid #0f1a10",fontSize:10,color:"#3a5c3a",lineHeight:1.6,letterSpacing:"0.05em" }}>
                💬 "{order.note}"
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 9, color: "#2a4a2a", letterSpacing: "0.15em" }}>
              📦 {order.eta}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── PROFILE & WALLET ──────────────────────────────────────────────────────────
function ProfileScreen({ balance, setBalance, accountNumber, orders, onBack, onGoOrders, onGoNotifications, onGoAddress, onGoRefer, onGoSupport, onSignOut }) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmt, setSelectedAmt] = useState(null);
  const [copied, setCopied] = useState(false);
  const amounts = [5000, 10000, 20000, 50000, 100000];

  const copyAcct = () => {
    navigator.clipboard?.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const doTopUp = () => {
    if (!selectedAmt) return;
    setBalance(b => b + selectedAmt);
    setShowTopUp(false);
    setSelectedAmt(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#060c07", display: "flex", flexDirection: "column", fontFamily: "monospace", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "52px 24px 20px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5c3a", fontSize: 11, cursor: "pointer", letterSpacing: "0.2em", marginBottom: 16, padding: 0 }}>← HOME</button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#0d1a0f", border: "2px solid #4caf7d44",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}>🌿</div>
          <div>
            <div style={{ fontSize: 20, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}>Thrive</div>
            <div style={{ fontSize: 9, color: "#3a5c3a", letterSpacing: "0.2em", marginTop: 3 }}>MEMBER SINCE 2024</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 40px" }}>
        {/* Wallet card */}
        <div style={{
          background: "linear-gradient(135deg, #0d1a0f 0%, #0a1a12 100%)",
          border: "1px solid #2a4a2c", padding: "22px", marginBottom: 16
        }}>
          <div style={{ fontSize: 9, color: "#3a5c3a", letterSpacing: "0.3em", marginBottom: 12 }}>BAZA WALLET</div>
          <div style={{ fontSize: 36, color: "#f0f0e8", fontWeight: 700, fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px", marginBottom: 4 }}>
            {fmt(balance)}
          </div>
          <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.15em", marginBottom: 20 }}>AVAILABLE BALANCE</div>
          <button onClick={() => setShowTopUp(true)} style={{
            padding: "11px 24px", background: "#4caf7d", border: "none",
            color: "#000", fontSize: 10, letterSpacing: "0.25em",
            cursor: "pointer", fontFamily: "monospace", fontWeight: 700
          }}>+ TOP UP WALLET</button>
        </div>

        {/* Account number */}
        <div style={{
          background: "#080f09", border: "1px solid #1a2a1c",
          padding: "16px", marginBottom: 10
        }}>
          <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.25em", marginBottom: 10 }}>YOUR DEDICATED ACCOUNT</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, color: "#f0f0e8", letterSpacing: "0.15em", fontWeight: 700 }}>{accountNumber}</div>
              <div style={{ fontSize: 9, color: "#3a5c3a", marginTop: 5, letterSpacing: "0.15em" }}>PROVIDUS BANK · BAZA NG LTD</div>
              <div style={{ fontSize: 9, color: "#2a4a2a", marginTop: 3, letterSpacing: "0.1em" }}>Transfer here to fund your wallet instantly</div>
            </div>
            <button onClick={copyAcct} style={{
              padding: "8px 14px", background: copied ? "#4caf7d18" : "transparent",
              border: copied ? "1px solid #4caf7d55" : "1px solid #1a2a1c",
              color: copied ? "#4caf7d" : "#3a5c3a",
              fontSize: 9, letterSpacing: "0.2em", cursor: "pointer", fontFamily: "monospace",
              transition: "all 0.2s"
            }}>{copied ? "COPIED ✓" : "COPY"}</button>
          </div>
        </div>

        {/* Orders link */}
        <button onClick={onGoOrders} style={{
          width: "100%", padding: "18px 16px",
          background: "#080f09", border: "1px solid #1a2a1c",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", marginBottom: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 18 }}>📦</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#d0e0d0", fontFamily: "monospace" }}>My Orders</div>
              <div style={{ fontSize: 9, color: "#2a4a2a", marginTop: 3, letterSpacing: "0.15em" }}>
                {orders.length === 0 ? "NO ORDERS YET" : `${orders.length} ORDER${orders.length !== 1 ? "S" : ""}`}
              </div>
            </div>
          </div>
          <span style={{ color: "#2a4a2a", fontSize: 18 }}>›</span>
        </button>

        {/* Wired profile rows */}
        {[
          { icon: "🔔", label: "Notifications", sub: "ALL ON", action: onGoNotifications },
          { icon: "🏠", label: "Delivery Address", sub: "VI, LAGOS", action: onGoAddress },
          { icon: "👥", label: "Refer a Friend", sub: "EARN ₦2,000", action: onGoRefer },
          { icon: "💬", label: "Contact Support", sub: "AI · HUMAN BACKUP", action: onGoSupport },
        ].map(row => (
          <button key={row.label} onClick={row.action} style={{
            width: "100%", padding: "18px 16px",
            background: "#080f09", border: "1px solid #1a2a1c",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", marginBottom: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 18 }}>{row.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, color: "#d0e0d0", fontFamily: "monospace" }}>{row.label}</div>
                <div style={{ fontSize: 9, color: "#2a4a2a", marginTop: 3, letterSpacing: "0.15em" }}>{row.sub}</div>
              </div>
            </div>
            <span style={{ color: "#2a4a2a", fontSize: 18 }}>›</span>
          </button>
        ))}

        {/* Sign out */}
        <button onClick={onSignOut} style={{
          width: "100%", padding: "16px", background: "transparent",
          border: "1px solid #2a1a1a", color: "#5a3a3a",
          fontSize: 10, letterSpacing: "0.25em", cursor: "pointer",
          fontFamily: "monospace", marginTop: 8
        }}>SIGN OUT</button>
      </div>

      {/* Top-up sheet */}
      {showTopUp && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end"
        }}>
          <div style={{ background: "#080f09", borderTop: "1px solid #1a2a1c", borderRadius: "20px 20px 0 0", padding: "24px 24px 48px" }}>
            <div style={{ width: 36, height: 4, background: "#1a2a1c", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.3em", marginBottom: 6 }}>ADD FUNDS</div>
            <div style={{ fontSize: 20, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px", marginBottom: 20 }}>How much?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {amounts.map(a => (
                <button key={a} onClick={() => setSelectedAmt(a)} style={{
                  padding: "13px 0", background: selectedAmt === a ? "#4caf7d18" : "transparent",
                  border: selectedAmt === a ? "1px solid #4caf7d66" : "1px solid #1a2a1c",
                  color: selectedAmt === a ? "#4caf7d" : "#5a8a5a",
                  fontSize: 13, cursor: "pointer", fontFamily: "monospace"
                }}>{fmt(a)}</button>
              ))}
            </div>
            <div style={{ background: "#0d1a0f", border: "1px solid #1a2a1c", padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.2em", marginBottom: 6 }}>TRANSFER TO</div>
              <div style={{ fontSize: 16, color: "#f0f0e8", letterSpacing: "0.1em" }}>{accountNumber}</div>
              <div style={{ fontSize: 9, color: "#3a5c3a", marginTop: 4, letterSpacing: "0.1em" }}>PROVIDUS BANK · BAZA NG LTD</div>
            </div>
            <button onClick={doTopUp} style={{
              width: "100%", padding: "15px", fontFamily: "monospace",
              background: selectedAmt ? "#4caf7d" : "#1a2a1c",
              border: "none", color: selectedAmt ? "#000" : "#2a3a2a",
              fontSize: 11, letterSpacing: "0.3em", cursor: selectedAmt ? "pointer" : "default",
              fontWeight: 700, marginBottom: 10, transition: "all 0.2s"
            }}>{selectedAmt ? `CONFIRM ${fmt(selectedAmt)}` : "SELECT AMOUNT"}</button>
            <button onClick={() => setShowTopUp(false)} style={{
              width: "100%", padding: "12px", background: "transparent",
              border: "none", color: "#2a3a2a", fontSize: 10, letterSpacing: "0.2em",
              cursor: "pointer", fontFamily: "monospace"
            }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NOTIFICATIONS SCREEN ─────────────────────────────────────────────────────
function NotificationsScreen({ onBack }) {
  const [prefs, setPrefs] = useState({
    orders: true, deals: true, delivery: true,
    reminders: false, newsletter: false,
  });
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const rows = [
    { key: "orders", label: "Order updates", desc: "Confirmation, dispatch, delivery" },
    { key: "delivery", label: "Rider on the way", desc: "Real-time delivery tracking alerts" },
    { key: "deals", label: "Member deals", desc: "Flash sales and exclusive drops" },
    { key: "reminders", label: "Restock reminders", desc: "When your usual items run low" },
    { key: "newsletter", label: "Weekly digest", desc: "New products and meal ideas" },
  ];
  return (
    <div style={{ width:"100%",height:"100%",background:"#070c08",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"52px 24px 20px",borderBottom:"1px solid #0f1a10" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#3a5c3a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:14,padding:0 }}>← PROFILE</button>
        <div style={{ fontSize:26,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Notifications</div>
        <div style={{ fontSize:9,color:"#2a4a2a",letterSpacing:"0.2em",marginTop:4 }}>CHOOSE WHAT YOU HEAR ABOUT</div>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"8px 24px 40px" }}>
        {rows.map((row,i) => (
          <div key={row.key} style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"18px 0",borderBottom:"1px solid #0f1a10",
            animation:`fadeUp 0.3s ${i*0.06}s both`
          }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,color:"#d0e0d0" }}>{row.label}</div>
              <div style={{ fontSize:9,color:"#2a4a2a",marginTop:4,letterSpacing:"0.1em" }}>{row.desc}</div>
            </div>
            {/* Toggle pill */}
            <button onClick={() => toggle(row.key)} style={{
              width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",
              background:prefs[row.key] ? "#4caf7d" : "#1a2a1c",
              position:"relative",transition:"background 0.2s",flexShrink:0
            }}>
              <div style={{
                position:"absolute",top:3,
                left:prefs[row.key] ? 23 : 3,
                width:20,height:20,borderRadius:"50%",
                background:prefs[row.key] ? "#000" : "#2a4a2a",
                transition:"left 0.2s"
              }}/>
            </button>
          </div>
        ))}
        <div style={{ marginTop:28,padding:"14px 16px",background:"#0a1a0c",border:"1px solid #1a2a1c" }}>
          <div style={{ fontSize:9,color:"#2a4a2a",letterSpacing:"0.2em",marginBottom:6 }}>PUSH NOTIFICATIONS</div>
          <div style={{ fontSize:11,color:"#4caf7d",lineHeight:1.7 }}>
            Enabled via your phone settings.<br />
            <span style={{ color:"#3a5c3a" }}>Baza will never spam you.</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── DELIVERY ADDRESS SCREEN ───────────────────────────────────────────────────
function DeliveryAddressScreen({ onBack }) {
  const [addresses, setAddresses] = useState([
    { id:"a1", label:"Home", address:"14 Akin Adesola Street, Victoria Island", landmark:"Near Access Bank", isDefault:true },
    { id:"a2", label:"Office", address:"Eko Atlantic, Block 3A", landmark:"Next to Civic Tower", isDefault:false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [newLandmark, setNewLandmark] = useState("");

  const setDefault = (id) => setAddresses(a => a.map(x => ({ ...x, isDefault: x.id === id })));
  const addNew = () => {
    if (!newAddr.trim()) return;
    setAddresses(a => [...a, { id:`a${Date.now()}`, label:newLabel||"New Address", address:newAddr, landmark:newLandmark, isDefault:false }]);
    setNewLabel(""); setNewAddr(""); setNewLandmark(""); setShowAdd(false);
  };

  return (
    <div style={{ width:"100%",height:"100%",background:"#070a0c",display:"flex",flexDirection:"column",fontFamily:"monospace",position:"relative" }}>
      <div style={{ padding:"52px 24px 20px",borderBottom:"1px solid #0f1520" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#3a5a7a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:14,padding:0 }}>← PROFILE</button>
        <div style={{ fontSize:26,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Delivery Address</div>
        <div style={{ fontSize:9,color:"#2a4060",letterSpacing:"0.2em",marginTop:4 }}>WHERE SHOULD WE BRING YOUR ORDER?</div>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"16px 24px 40px" }}>
        {addresses.map((addr,i) => (
          <div key={addr.id} style={{
            background:addr.isDefault ? "#0a1220" : "#080c10",
            border:`1px solid ${addr.isDefault ? "#2a4a8a" : "#1a2540"}`,
            padding:"16px",marginBottom:10,
            animation:`fadeUp 0.3s ${i*0.07}s both`
          }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:16 }}>{addr.label==="Home"?"🏠":"🏢"}</span>
                <div style={{ fontSize:12,color:"#c8d8f0",fontFamily:"'DM Serif Display',serif" }}>{addr.label}</div>
              </div>
              {addr.isDefault
                ? <span style={{ fontSize:8,color:"#6ec6ff",letterSpacing:"0.2em",padding:"3px 8px",border:"1px solid #6ec6ff33" }}>DEFAULT</span>
                : <button onClick={()=>setDefault(addr.id)} style={{ fontSize:8,color:"#3a5a7a",letterSpacing:"0.2em",padding:"3px 8px",border:"1px solid #1a2540",background:"none",cursor:"pointer" }}>SET DEFAULT</button>
              }
            </div>
            <div style={{ fontSize:11,color:"#8aa0c0",lineHeight:1.6 }}>{addr.address}</div>
            {addr.landmark && <div style={{ fontSize:9,color:"#2a4060",marginTop:4,letterSpacing:"0.1em" }}>📍 {addr.landmark}</div>}
          </div>
        ))}
        <button onClick={()=>setShowAdd(true)} style={{
          width:"100%",padding:"15px",background:"transparent",
          border:"1px dashed #1a2540",color:"#3a5a7a",
          fontSize:10,letterSpacing:"0.25em",cursor:"pointer",fontFamily:"monospace"
        }}>+ ADD NEW ADDRESS</button>
      </div>
      {showAdd && (
        <div style={{ position:"absolute",inset:0,zIndex:400,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",justifyContent:"flex-end" }}>
          <div style={{ background:"#080c10",borderTop:"1px solid #1a2540",borderRadius:"20px 20px 0 0",padding:"24px 24px 48px" }}>
            <div style={{ width:36,height:4,background:"#1a2540",borderRadius:2,margin:"0 auto 20px" }}/>
            <div style={{ fontSize:9,color:"#2a4060",letterSpacing:"0.3em",marginBottom:4 }}>NEW ADDRESS</div>
            <div style={{ fontSize:18,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",marginBottom:16 }}>Where to?</div>
            {[
              { label:"LABEL (e.g. Home, Office)", val:newLabel, set:setNewLabel, ph:"Home" },
              { label:"FULL ADDRESS", val:newAddr, set:setNewAddr, ph:"14 Akin Adesola Street, VI" },
              { label:"LANDMARK (optional)", val:newLandmark, set:setNewLandmark, ph:"Near Access Bank" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:12 }}>
                <div style={{ fontSize:8,color:"#2a4060",letterSpacing:"0.2em",marginBottom:6 }}>{f.label}</div>
                <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  style={{ width:"100%",background:"#0d1520",border:"1px solid #1a2540",padding:"11px 14px",color:"#c8d8f0",fontSize:12,fontFamily:"monospace",outline:"none" }}
                />
              </div>
            ))}
            <button onClick={addNew} style={{ width:"100%",padding:"14px",background:"#6ec6ff",border:"none",color:"#000",fontSize:10,letterSpacing:"0.3em",fontFamily:"monospace",cursor:"pointer",fontWeight:700,marginTop:8,marginBottom:10 }}>SAVE ADDRESS</button>
            <button onClick={()=>setShowAdd(false)} style={{ width:"100%",padding:"12px",background:"transparent",border:"none",color:"#2a4060",fontSize:10,letterSpacing:"0.2em",cursor:"pointer",fontFamily:"monospace" }}>CANCEL</button>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── REFER A FRIEND SCREEN ─────────────────────────────────────────────────────
function ReferScreen({ onBack }) {
  const code = "THRIVE200";
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState([]);
  const [inputPhone, setInputPhone] = useState("");

  const copyCode = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  const sendInvite = () => {
    if (!inputPhone.trim()) return;
    setSent(s => [inputPhone, ...s]);
    setInputPhone("");
  };

  const perks = [
    { who:"You", earn:"₦2,000", when:"Friend places first order" },
    { who:"Friend", earn:"₦1,000", when:"Off their first order" },
  ];

  return (
    <div style={{ width:"100%",height:"100%",background:"#0a0a08",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"52px 24px 20px",borderBottom:"1px solid #1a1a10" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#7a7a3a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:14,padding:0 }}>← PROFILE</button>
        <div style={{ fontSize:26,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Refer a Friend</div>
        <div style={{ fontSize:9,color:"#4a4a2a",letterSpacing:"0.2em",marginTop:4 }}>BOTH OF YOU WIN</div>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"16px 24px 40px" }}>
        {/* Perk cards */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
          {perks.map(p => (
            <div key={p.who} style={{ background:"#0f0f08",border:"1px solid #2a2a14",padding:"16px 14px" }}>
              <div style={{ fontSize:9,color:"#4a4a2a",letterSpacing:"0.2em",marginBottom:6 }}>{p.who.toUpperCase()} GET</div>
              <div style={{ fontSize:22,color:"#f5a623",fontFamily:"'DM Serif Display',serif",letterSpacing:"-0.5px",marginBottom:6 }}>{p.earn}</div>
              <div style={{ fontSize:9,color:"#5a5a3a",lineHeight:1.6 }}>{p.when}</div>
            </div>
          ))}
        </div>

        {/* Referral code */}
        <div style={{ background:"#0f0f08",border:"1px solid #2a2a14",padding:"18px",marginBottom:16 }}>
          <div style={{ fontSize:9,color:"#4a4a2a",letterSpacing:"0.25em",marginBottom:10 }}>YOUR REFERRAL CODE</div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ fontSize:28,color:"#f5a623",fontWeight:700,letterSpacing:"0.2em" }}>{code}</div>
            <button onClick={copyCode} style={{
              padding:"9px 16px",background:copied?"#f5a62322":"transparent",
              border:copied?"1px solid #f5a62355":"1px solid #2a2a14",
              color:copied?"#f5a623":"#5a5a3a",
              fontSize:9,letterSpacing:"0.2em",cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s"
            }}>{copied?"COPIED ✓":"COPY"}</button>
          </div>
        </div>

        {/* Send via phone number */}
        <div style={{ fontSize:9,color:"#3a3a1a",letterSpacing:"0.25em",marginBottom:10 }}>INVITE BY PHONE</div>
        <div style={{ display:"flex",gap:8,marginBottom:16 }}>
          <input value={inputPhone} onChange={e=>setInputPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            style={{ flex:1,background:"#0f0f08",border:"1px solid #2a2a14",padding:"11px 14px",color:"#d0d0b0",fontSize:12,fontFamily:"monospace",outline:"none" }}
          />
          <button onClick={sendInvite} style={{ padding:"11px 18px",background:"#f5a623",border:"none",color:"#000",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace" }}>SEND</button>
        </div>

        {sent.length > 0 && (
          <>
            <div style={{ fontSize:9,color:"#3a3a1a",letterSpacing:"0.25em",marginBottom:10 }}>INVITED</div>
            {sent.map((p,i) => (
              <div key={i} style={{ fontSize:11,color:"#5a5a3a",padding:"10px 0",borderBottom:"1px solid #1a1a0a",display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ color:"#4caf7d",fontSize:12 }}>✓</span>{p}
                <span style={{ color:"#3a3a1a",fontSize:9,letterSpacing:"0.1em",marginLeft:"auto" }}>INVITE SENT</span>
              </div>
            ))}
          </>
        )}

        <div style={{ marginTop:24,fontSize:10,color:"#2a2a14",lineHeight:1.8,letterSpacing:"0.05em",borderTop:"1px solid #1a1a0a",paddingTop:16 }}>
          Reward credited within 24hrs of friend's first delivery.<br/>No cap on referrals. Invite as many as you want.
        </div>
      </div>
    </div>
  );
}

// ── AUTH FLOW (Sign In / Sign Up) ─────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("welcome"); // welcome | signin | signup | otp
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [refApplied, setRefApplied] = useState(false);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [step, setStep] = useState(0);
  const otpRefs = useRef([]);

  const handleOtpChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i+1]?.focus();
    if (next.every(d => d !== "")) {
      setTimeout(() => onAuth({ phone, name: name || "Member" }), 400);
    }
  };

  const goOtp = () => { if (phone.length >= 8) setMode("otp"); };

  if (mode === "welcome") return (
    <div style={{ width:"100%",height:"100%",background:"#060d07",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"monospace",padding:"0 32px" }}>
      <div style={{ fontSize:9,letterSpacing:"0.4em",color:"#2a4a2a",marginBottom:28 }}>MEMBERS ONLY · LAGOS</div>
      <div style={{ fontSize:64,fontWeight:900,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-3px",lineHeight:1 }}>baza</div>
      <div style={{ fontSize:14,color:"#4caf7d",fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:48 }}>.ng</div>

      <div style={{ fontSize:13,color:"#4a6a4a",textAlign:"center",lineHeight:1.8,marginBottom:48 }}>
        The smarter way to stock your kitchen.<br/>
        <span style={{ color:"#2a4a2a" }}>Members-only pricing. Delivered.</span>
      </div>

      <button onClick={()=>setMode("signup")} style={{
        width:"100%",padding:"16px",background:"#4caf7d",border:"none",
        color:"#000",fontSize:11,letterSpacing:"0.3em",fontFamily:"monospace",
        cursor:"pointer",fontWeight:700,marginBottom:12
      }}>CREATE ACCOUNT</button>

      <button onClick={()=>setMode("signin")} style={{
        width:"100%",padding:"14px",background:"transparent",
        border:"1px solid #1a2a1c",color:"#3a5c3a",
        fontSize:10,letterSpacing:"0.25em",fontFamily:"monospace",cursor:"pointer"
      }}>SIGN IN</button>

      <div style={{ marginTop:32,fontSize:9,color:"#1a2a1a",textAlign:"center",lineHeight:1.8,letterSpacing:"0.1em" }}>
        By continuing, you agree to Baza's<br/>Terms of Service & Privacy Policy.
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');`}</style>
    </div>
  );

  if (mode === "signup") return (
    <div style={{ width:"100%",height:"100%",background:"#060d07",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"60px 24px 32px" }}>
        <button onClick={()=>setMode("welcome")} style={{ background:"none",border:"none",color:"#3a5c3a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:20,padding:0 }}>← BACK</button>
        <div style={{ fontSize:9,color:"#2a4a2a",letterSpacing:"0.3em",marginBottom:8 }}>NEW MEMBER</div>
        <div style={{ fontSize:28,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Create account</div>
      </div>
      <div style={{ flex:1,padding:"0 24px" }}>
        {[
          { label:"YOUR NAME", val:name, set:setName, ph:"Thrive", type:"text" },
          { label:"PHONE NUMBER", val:phone, set:setPhone, ph:"+234 800 000 0000", type:"tel" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:16 }}>
            <div style={{ fontSize:8,color:"#2a4a2a",letterSpacing:"0.25em",marginBottom:8 }}>{f.label}</div>
            <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
              style={{ width:"100%",background:"#0d1a0f",border:"1px solid #1a2a1c",padding:"14px 16px",color:"#f0f0e8",fontSize:14,fontFamily:"monospace",outline:"none" }}
            />
          </div>
        ))}

        {/* Referral code */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:8,color:"#2a4a2a",letterSpacing:"0.25em",marginBottom:8 }}>REFERRAL CODE <span style={{ color:"#1a2a1a" }}>(OPTIONAL)</span></div>
          <div style={{ display:"flex",gap:8 }}>
            <input
              value={refCode} onChange={e=>{ setRefCode(e.target.value.toUpperCase()); setRefApplied(false); }}
              placeholder="e.g. THRIVE200" maxLength={12}
              style={{ flex:1,background:"#0d1a0f",border:`1px solid ${refApplied?"#4caf7d66":"#1a2a1c"}`,padding:"12px 14px",color:refApplied?"#4caf7d":"#f0f0e8",fontSize:13,fontFamily:"monospace",outline:"none",letterSpacing:"0.1em" }}
            />
            <button
              onClick={()=>{ if(refCode.length>=4) setRefApplied(true); }}
              style={{ padding:"12px 16px",background:refApplied?"#4caf7d18":"transparent",border:refApplied?"1px solid #4caf7d55":"1px solid #1a2a1c",color:refApplied?"#4caf7d":"#3a5c3a",fontSize:9,letterSpacing:"0.15em",cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s" }}
            >{refApplied?"✓ APPLIED":"APPLY"}</button>
          </div>
          {refApplied && (
            <div style={{ fontSize:9,color:"#4caf7d",marginTop:6,letterSpacing:"0.1em" }}>
              ₦1,000 credit will be added after your first order.
            </div>
          )}
        </div>

        <div style={{ fontSize:9,color:"#2a4a2a",letterSpacing:"0.1em",marginBottom:28,lineHeight:1.8 }}>
          We'll send a verification code to your number.<br/>
          <span style={{ color:"#1a2a1a" }}>Standard SMS rates may apply.</span>
        </div>
        <button onClick={goOtp} style={{
          width:"100%",padding:"16px",background:phone.length>=8?"#4caf7d":"#1a2a1c",
          border:"none",color:phone.length>=8?"#000":"#2a3a2a",
          fontSize:11,letterSpacing:"0.3em",fontFamily:"monospace",
          cursor:phone.length>=8?"pointer":"default",fontWeight:700,transition:"all 0.2s"
        }}>SEND VERIFICATION CODE</button>
      </div>
    </div>
  );

  if (mode === "signin") return (
    <div style={{ width:"100%",height:"100%",background:"#060d07",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"60px 24px 32px" }}>
        <button onClick={()=>setMode("welcome")} style={{ background:"none",border:"none",color:"#3a5c3a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:20,padding:0 }}>← BACK</button>
        <div style={{ fontSize:9,color:"#2a4a2a",letterSpacing:"0.3em",marginBottom:8 }}>WELCOME BACK</div>
        <div style={{ fontSize:28,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px" }}>Sign in</div>
      </div>
      <div style={{ flex:1,padding:"0 24px" }}>
        <div style={{ fontSize:8,color:"#2a4a2a",letterSpacing:"0.25em",marginBottom:8 }}>PHONE NUMBER</div>
        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234 800 000 0000"
          style={{ width:"100%",background:"#0d1a0f",border:"1px solid #1a2a1c",padding:"14px 16px",color:"#f0f0e8",fontSize:14,fontFamily:"monospace",outline:"none",marginBottom:28 }}
        />
        <button onClick={goOtp} style={{
          width:"100%",padding:"16px",background:phone.length>=8?"#4caf7d":"#1a2a1c",
          border:"none",color:phone.length>=8?"#000":"#2a3a2a",
          fontSize:11,letterSpacing:"0.3em",fontFamily:"monospace",
          cursor:phone.length>=8?"pointer":"default",fontWeight:700,transition:"all 0.2s"
        }}>SEND CODE</button>
        <div style={{ marginTop:20,fontSize:9,color:"#1a2a1a",textAlign:"center",letterSpacing:"0.1em" }}>
          Don't have an account?{" "}
          <button onClick={()=>setMode("signup")} style={{ background:"none",border:"none",color:"#4caf7d",fontSize:9,letterSpacing:"0.1em",cursor:"pointer",padding:0 }}>SIGN UP</button>
        </div>
      </div>
    </div>
  );

  if (mode === "otp") return (
    <div style={{ width:"100%",height:"100%",background:"#060d07",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      <div style={{ padding:"60px 24px 32px" }}>
        <button onClick={()=>setMode(name?"signup":"signin")} style={{ background:"none",border:"none",color:"#3a5c3a",fontSize:11,cursor:"pointer",letterSpacing:"0.2em",marginBottom:20,padding:0 }}>← BACK</button>
        <div style={{ fontSize:9,color:"#2a4a2a",letterSpacing:"0.3em",marginBottom:8 }}>VERIFICATION</div>
        <div style={{ fontSize:28,color:"#f0f0e8",fontFamily:"'DM Serif Display',serif",letterSpacing:"-1px",marginBottom:8 }}>Enter the code</div>
        <div style={{ fontSize:11,color:"#3a5c3a",lineHeight:1.6 }}>Sent to <span style={{ color:"#f0f0e8" }}>{phone}</span></div>
      </div>
      <div style={{ flex:1,padding:"0 24px" }}>
        {/* 6-digit OTP boxes */}
        <div style={{ display:"flex",gap:10,justifyContent:"center",marginBottom:32 }}>
          {otp.map((d,i) => (
            <input key={i} ref={el=>otpRefs.current[i]=el}
              maxLength={1} value={d}
              onChange={e=>handleOtpChange(e.target.value,i)}
              onKeyDown={e=>{ if(e.key==="Backspace"&&!d&&i>0) otpRefs.current[i-1]?.focus(); }}
              style={{
                width:46,height:56,textAlign:"center",
                background:"#0d1a0f",border:`1px solid ${d?"#4caf7d66":"#1a2a1c"}`,
                color:"#f0f0e8",fontSize:22,fontFamily:"monospace",outline:"none",
                transition:"border-color 0.2s"
              }}
            />
          ))}
        </div>
        <div style={{ textAlign:"center",fontSize:9,color:"#2a4a2a",letterSpacing:"0.15em",marginBottom:24 }}>
          Enter any 6 digits to continue (demo)
        </div>
        <button onClick={()=>onAuth({phone,name:name||"Member"})} style={{
          width:"100%",padding:"16px",background:"#1a2a1c",
          border:"none",color:"#2a3a2a",fontSize:11,letterSpacing:"0.3em",
          fontFamily:"monospace",cursor:"pointer",fontWeight:700
        }}>VERIFY →</button>
        <div style={{ marginTop:20,textAlign:"center" }}>
          <button onClick={()=>setOtp(["","","","","",""])} style={{ background:"none",border:"none",color:"#2a4a2a",fontSize:9,letterSpacing:"0.15em",cursor:"pointer",padding:0 }}>RESEND CODE</button>
        </div>
      </div>
    </div>
  );

  return null;
}


// ── SUPPORT CHAT SCREEN ───────────────────────────────────────────────────────
// AI first. If AI detects frustration / complex issue, it flags for human review.
const SUPPORT_BOTS = [
  {
    triggers: ["order","delivery","deliver","arrive","eta","track","where"],
    reply: "I can look into that for you. Can you share your order ID? It starts with ORD- and you'll find it in your Orders screen.",
    flag: false
  },
  {
    triggers: ["wrong","missing","incorrect","damaged","broken","spoiled","bad"],
    reply: "I'm really sorry to hear that. That's not the experience we want for you. Can you describe what happened and which item it was? I'm flagging this for our team to review.",
    flag: true
  },
  {
    triggers: ["refund","money","credit","charge","payment","wallet","deduct"],
    reply: "Understood — wallet and payment issues get priority. Let me pull up your account. Can you tell me the approximate amount and when the issue occurred?",
    flag: false
  },
  {
    triggers: ["cancel","cancell"],
    reply: "I can help with that. Orders can be cancelled within 30 minutes of placement. What's your order ID?",
    flag: false
  },
  {
    triggers: ["member","membership","subscription","plan"],
    reply: "Your Baza membership gives you access to member pricing and free delivery. Is there something specific about your membership you'd like help with?",
    flag: false
  },
  {
    triggers: ["human","person","agent","speak","talk","staff","team","help","urgent","escalat"],
    reply: "Understood — I'm flagging this conversation for one of our team members. They'll join within 30 minutes during business hours (8am–8pm WAT). Hang tight.",
    flag: true
  },
];

function SupportChatScreen({ onBack }) {
  const [messages, setMessages] = useState([{
    from:"ai",
    text:"Hey! 👋 I'm Baza's support assistant. I handle most things instantly — orders, payments, delivery, and more. What can I help with today?",
    flagged:false
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [humanJoined, setHumanJoined] = useState(false);
  const [resolved, setResolved] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,typing]);

  const quickReplies = messages.length <= 1
    ? ["Track my order","Something was missing","Wallet issue","Cancel an order","Talk to a person"]
    : [];

  const send = (text=input) => {
    if (!text.trim()) return;
    setMessages(m=>[...m,{from:"user",text}]);
    setInput(""); setTyping(true);

    setTimeout(()=>{
      const lower = text.toLowerCase();
      const match = SUPPORT_BOTS.find(b=>b.triggers.some(t=>lower.includes(t)));
      const reply = match?.reply || "Got it. Let me check on that. Could you give me a bit more detail so I can help you properly?";
      const shouldFlag = match?.flag || false;

      setMessages(m=>[...m,{from:"ai",text:reply,flagged:shouldFlag}]);
      setTyping(false);

      if (shouldFlag && !flagged) {
        setFlagged(true);
        // Simulate human joining after a delay
        setTimeout(()=>{
          setMessages(m=>[...m,{
            from:"system",
            text:"👤 Adaeze from the Baza team has joined the chat."
          }]);
          setHumanJoined(true);
          setTimeout(()=>{
            setMessages(m=>[...m,{
              from:"human",
              text:"Hi! I've read through your message and I'm here to help directly. Let me sort this out for you right now."
            }]);
          }, 1200);
        }, 4000);
      }
    }, 800 + Math.random()*600);
  };

  const msgColors = {
    user: { bg:"#ff704318", border:"#ff704333", align:"flex-end" },
    ai:   { bg:"#0d1a0f",   border:"#1a2a1c",   align:"flex-start" },
    human:{ bg:"#0d1220",   border:"#2a4a8a44", align:"flex-start" },
    system:{ bg:"transparent", border:"none",   align:"center" },
  };

  return (
    <div style={{ width:"100%",height:"100%",background:"#07090f",display:"flex",flexDirection:"column",fontFamily:"monospace" }}>
      {/* Header */}
      <div style={{ padding:"52px 20px 14px",borderBottom:"1px solid #0f1220",display:"flex",alignItems:"center",gap:12 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#3a5a8a",fontSize:11,cursor:"pointer",padding:0,marginRight:4 }}>←</button>
        <div style={{ position:"relative" }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:"#0d1a2a",border:"1px solid #1a2a4a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🤖</div>
          {humanJoined && (
            <div style={{ position:"absolute",bottom:0,right:0,width:12,height:12,borderRadius:"50%",background:"#4caf7d",border:"2px solid #07090f" }}/>
          )}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13,color:"#f0f0e8" }}>{humanJoined ? "Adaeze + Assistant" : "Baza Support"}</div>
          <div style={{ fontSize:9,letterSpacing:"0.15em",marginTop:2 }}>
            {humanJoined
              ? <span style={{ color:"#4caf7d" }}>● TEAM MEMBER JOINED</span>
              : flagged
              ? <span style={{ color:"#f5a623" }}>● FLAGGING FOR TEAM</span>
              : <span style={{ color:"#3a5a8a" }}>● AI ASSISTANT</span>
            }
          </div>
        </div>
        {flagged && !humanJoined && (
          <div style={{ fontSize:8,color:"#f5a623",letterSpacing:"0.15em",padding:"4px 8px",border:"1px solid #f5a62333",background:"#f5a62308" }}>
            TEAM NOTIFIED
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1,overflowY:"auto",padding:"14px 20px",display:"flex",flexDirection:"column",gap:10 }}>
        {messages.map((msg,i)=>{
          const style = msgColors[msg.from] || msgColors.ai;
          if (msg.from === "system") return (
            <div key={i} style={{ textAlign:"center",fontSize:9,color:"#3a5a3a",letterSpacing:"0.15em",padding:"8px 0" }}>{msg.text}</div>
          );
          return (
            <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:style.align }}>
              {msg.from==="human" && <div style={{ fontSize:8,color:"#6ec6ff",letterSpacing:"0.15em",marginBottom:4 }}>ADAEZE · BAZA TEAM</div>}
              {msg.from==="ai" && <div style={{ fontSize:8,color:"#3a5a3a",letterSpacing:"0.15em",marginBottom:4 }}>BAZA AI</div>}
              <div style={{
                maxWidth:"80%",padding:"10px 14px",
                background:style.bg,border:`1px solid ${style.border}`,
                fontSize:12,color:"#d0d8e0",lineHeight:1.6
              }}>{msg.text}</div>
              {msg.flagged && (
                <div style={{ fontSize:8,color:"#f5a623",marginTop:4,letterSpacing:"0.15em" }}>⚑ FLAGGED FOR TEAM REVIEW</div>
              )}
            </div>
          );
        })}
        {typing && (
          <div style={{ display:"flex",gap:4,padding:"10px 14px",background:"#0d1a0f",border:"1px solid #1a2a1c",width:52 }}>
            {[0,1,2].map(i=><div key={i} style={{ width:5,height:5,background:"#3a5a3a",borderRadius:"50%",animation:`bounce 1s ${i*0.15}s infinite` }}/>)}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && (
        <div style={{ padding:"8px 16px 0",display:"flex",gap:8,overflowX:"auto" }}>
          {quickReplies.map(r=>(
            <button key={r} onClick={()=>send(r)} style={{ whiteSpace:"nowrap",padding:"7px 14px",background:"transparent",border:"1px solid #1a2a3a",color:"#3a5a7a",fontSize:9,letterSpacing:"0.1em",cursor:"pointer" }}>{r}</button>
          ))}
        </div>
      )}

      {/* Input */}
      {!resolved ? (
        <div style={{ padding:"10px 16px 36px",display:"flex",gap:10,borderTop:"1px solid #0f1220" }}>
          <input
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Describe your issue..."
            style={{ flex:1,background:"#0d1220",border:"1px solid #1a2540",padding:"11px 14px",color:"#c8d8f0",fontSize:12,fontFamily:"monospace",outline:"none" }}
          />
          <button onClick={()=>send()} style={{ padding:"11px 16px",background:"#3a5a8a",border:"none",color:"#fff",fontSize:14,cursor:"pointer" }}>↑</button>
        </div>
      ) : (
        <div style={{ padding:"16px 24px 36px",textAlign:"center",fontSize:10,color:"#3a5c3a",letterSpacing:"0.2em" }}>
          ✓ RESOLVED · THANK YOU
        </div>
      )}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── FLOATING CART BUTTON ─────────────────────────────────────────────────────
function FloatingCart({ cart, onGoCart }) {
  const total = cart.reduce((a, i) => a + (i.price || 0), 0);
  const [bump, setBump] = useState(false);
  const prevLen = useRef(cart.length);

  useEffect(() => {
    if (cart.length > prevLen.current) {
      setBump(true);
      setTimeout(() => setBump(false), 400);
    }
    prevLen.current = cart.length;
  }, [cart.length]);

  if (cart.length === 0) return null;

  return (
    <button onClick={onGoCart} style={{
      position:"absolute", top:52, right:16, left:"auto", zIndex:200,
      background:"#f0f0e8", border:"none",
      padding:"8px 14px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      cursor:"pointer",
      boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
      transform: bump ? "scale(1.03)" : "scale(1)",
      transition:"transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      animation:"slideUp 0.3s ease both"
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ position:"relative" }}>
          <span style={{ fontSize:18 }}>🛒</span>
          <div style={{
            position:"absolute", top:-6, right:-8,
            width:16, height:16, borderRadius:"50%",
            background:"#4caf7d", border:"2px solid #f0f0e8",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:8, color:"#000", fontWeight:700, fontFamily:"monospace"
          }}>{cart.length}</div>
        </div>
        <div style={{ textAlign:"left" }}>
          <div style={{ fontSize:10, color:"#000", fontFamily:"monospace", fontWeight:700, letterSpacing:"0.1em" }}>CART</div>
          <div style={{ fontSize:9, color:"#555", fontFamily:"monospace", marginTop:1 }}>
            {cart.length} item{cart.length!==1?"s":""} · {fmt(total)}
          </div>
        </div>
      </div>
      <div style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#000", letterSpacing:"0.1em" }}>›</div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </button>
  );
}


// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function BazaApp() {
  const [screen, setScreen] = useState("splash");
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [balance, setBalance] = useState(24500);
  const [orders, setOrders] = useState([]);
  const accountNumber = "2038471659";

  const handleAuth = (userData) => { setUser(userData); setAuthed(true); setScreen("intent"); };
  const handleSignOut = () => { setAuthed(false); setUser(null); setCart([]); setScreen("auth"); };

  return (
    <div style={{ minHeight: "100vh", background: "#030503", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* iPhone 15 Pro — 393 × 852 */}
      <div style={{
        width: 393, height: 852, background: "#050805", borderRadius: 54,
        boxShadow: "0 0 0 10px #0e120e, 0 0 0 12px #151915, 0 50px 140px rgba(0,0,0,0.9)",
        position: "relative", overflow: "hidden", border: "1px solid #1a221a"
      }}>
        {/* Dynamic island */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 34, background: "#000", borderRadius: 20, zIndex: 999 }} />

        {/* Status bar */}
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 28px 0 24px", zIndex: 998, height: 20 }}>
          <span style={{ fontSize: 11, color: "#556655", fontWeight: 600, fontFamily: "monospace" }}>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              {[1,2,3].map((_, i) => <div key={i} style={{ width: 3, height: 4 + i * 2.5, background: "#556655", borderRadius: 1 }} />)}
            </div>
            <div style={{ width: 22, height: 11, border: "1px solid #556655", borderRadius: 3, position: "relative" }}>
              <div style={{ position: "absolute", top: 2, left: 2, right: 5, bottom: 2, background: "#4caf7d", borderRadius: 1.5 }} />
              <div style={{ position: "absolute", right: -4, top: 3, width: 3, height: 5, background: "#556655", borderRadius: "0 1px 1px 0" }} />
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", inset: 0 }}>
          {screen === "splash"  && <Splash onDone={() => setScreen(authed ? "intent" : "auth")} />}
          {screen === "auth"    && <AuthScreen onAuth={handleAuth} />}
          {screen === "intent"  && (
            <IntentGateWithBalance
              balance={balance} setBalance={setBalance}
              accountNumber={accountNumber}
              cart={cart} orders={orders}
              onSelect={setScreen}
              onProfile={() => setScreen("profile")}
              onGoOrders={() => setScreen("orders")}
              onGoCart={() => setScreen("cart")}
            />
          )}
          {screen === "stockup"  && <StockUpMode   cart={cart} setCart={setCart} onBack={() => setScreen("intent")} />}
          {screen === "tonight"  && <TonightMode   cart={cart} setCart={setCart} onBack={() => setScreen("intent")} />}
          {screen === "readyeat" && <ReadyEatMode  cart={cart} setCart={setCart} onBack={() => setScreen("intent")} />}
          {screen === "quickies" && <QuickiesMode  cart={cart} setCart={setCart} onBack={() => setScreen("intent")} />}
          {screen === "restock"  && <RestockMode   cart={cart} setCart={setCart} onBack={() => setScreen("intent")} />}
          {screen === "chat"     && <ChatMode      cart={cart} setCart={setCart} onBack={() => setScreen("intent")} />}
          {screen === "cart"    && (
            <CartScreen
              cart={cart} setCart={setCart}
              balance={balance} setBalance={setBalance}
              accountNumber={accountNumber}
              setOrders={setOrders}
              onBack={() => setScreen("intent")}
              onGoProfile={() => setScreen("profile")}
            />
          )}
          {screen === "profile" && (
            <ProfileScreen
              balance={balance} setBalance={setBalance}
              accountNumber={accountNumber}
              orders={orders}
              onBack={() => setScreen("intent")}
              onGoOrders={() => setScreen("orders")}
              onGoNotifications={() => setScreen("notifications")}
              onGoAddress={() => setScreen("address")}
              onGoRefer={() => setScreen("refer")}
              onGoSupport={() => setScreen("support")}
              onSignOut={handleSignOut}
            />
          )}
          {screen === "notifications" && <NotificationsScreen onBack={() => setScreen("profile")} />}
          {screen === "support"       && <SupportChatScreen onBack={() => setScreen("profile")} />}
          {screen === "address"       && <DeliveryAddressScreen onBack={() => setScreen("profile")} />}
          {screen === "refer"         && <ReferScreen onBack={() => setScreen("profile")} />}
          {screen === "orders"  && <OrdersScreen orders={orders} onBack={() => setScreen("profile")} />}

          {/* Floating cart — visible on all shopping screens */}
          {!["cart","splash","intent","profile","orders","notifications","address","refer","support","auth"].includes(screen) && (
            <FloatingCart cart={cart} onGoCart={() => setScreen("cart")} />
          )}
        </div>

        {/* Home indicator */}
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, background: "#1a2a1a", borderRadius: 3, zIndex: 999 }} />
      </div>

      <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 9, letterSpacing: "0.25em", color: "#1a2a1a", fontFamily: "monospace" }}>
        BAZA.NG · IPHONE 15 PRO · 393×852
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

// ── INTENT GATE WITH BALANCE ──────────────────────────────────────────────────
function IntentGateWithBalance({ balance, setBalance, accountNumber, cart, orders, onSelect, onProfile, onGoOrders, onGoCart }) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmt, setSelectedAmt] = useState(null);
  const cartTotal = cart.reduce((a, i) => a + (i.price || 0), 0);

  const doTopUp = () => {
    if (!selectedAmt) return;
    setBalance(b => b + selectedAmt);
    setShowTopUp(false);
    setSelectedAmt(null);
  };

  const modes = [
    { key: "stockup",  emoji: "🏠", title: "Stock up the house", desc: "Bundles for the week or month", color: "#4caf7d" },
    { key: "tonight",  emoji: "🍳", title: "Cook a meal", desc: "Meal packs for any time of day", color: "#f5a623" },
    { key: "readyeat", emoji: "🥡", title: "Ready to eat", desc: "Hot food, delivered now", color: "#e85c3a" },
    { key: "quickies", emoji: "⚡", title: "Quickies", desc: "Bread, smoothies, eggrolls & more", color: "#c77dff" },
    { key: "restock",  emoji: "🔍", title: "I just need one thing", desc: "Search and grab. Quick.", color: "#6ec6ff" },
    { key: "chat",     emoji: "💬", title: "Help me decide", desc: "Chat with our assistant", color: "#ff7043" },
  ];

  const hasCart = cart.length > 0;
  const hasOrders = orders.length > 0;
  // bottom padding to clear sticky cart card
  const bottomPad = hasCart ? 100 : 24;

  return (
    <div style={{ width: "100%", height: "100%", background: "#080f09", display: "flex", flexDirection: "column", fontFamily: "monospace", position: "relative" }}>

      {/* ── Top bar: balance + top-up + avatar ── */}
      <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#2a4a2a", marginBottom: 5 }}>WALLET</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontSize: 24, color: "#f0f0e8", fontWeight: 700, fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px" }}>{fmt(balance)}</div>
            <button onClick={() => setShowTopUp(true)} style={{
              padding: "4px 10px", background: "#4caf7d18",
              border: "1px solid #4caf7d44", color: "#4caf7d",
              fontSize: 9, letterSpacing: "0.2em", cursor: "pointer",
              fontFamily: "monospace"
            }}>+ TOP UP</button>
          </div>
          <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.15em", marginTop: 3 }}>AVAILABLE</div>
        </div>
        <button onClick={onProfile} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#0d1a0f", border: "1px solid #2a4a2c",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, cursor: "pointer"
        }}>🌿</button>
      </div>

      {/* ── Greeting ── */}
      <div style={{ padding: "16px 24px 16px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#2a4a2a", marginBottom: 6 }}>6:42 PM · LAGOS</div>
        <div style={{ fontSize: 26, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-1px", lineHeight: 1.2 }}>
          What are we<br />doing today?
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: `0 20px ${bottomPad}px` }}>

        {/* Orders card — only if there are orders */}
        {hasOrders && (
          <button onClick={onGoOrders} style={{
            width: "100%", background: "#0a1a0c", border: "1px solid #1e3a20",
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer", textAlign: "left", marginBottom: 12,
            animation: "fadeUp 0.3s ease both"
          }}>
            <span style={{ fontSize: 20 }}>📦</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#c8e0ca", fontFamily: "'DM Serif Display', serif" }}>My Orders</div>
              <div style={{ fontSize: 9, color: "#3a6a3c", marginTop: 3, letterSpacing: "0.15em" }}>
                {orders.length} ORDER{orders.length !== 1 ? "S" : ""} · LATEST: {orders[0]?.status?.toUpperCase()}
              </div>
            </div>
            <span style={{ color: "#4caf7d", fontSize: 9, letterSpacing: "0.2em" }}>VIEW ›</span>
          </button>
        )}

        {/* Mode cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {modes.map((m, i) => (
            <button key={m.key} onClick={() => onSelect(m.key)} style={{
              background: "#0d1a0f", border: "1px solid #1a2a1c",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer", textAlign: "left",
              animation: `fadeUp 0.35s ${i * 0.07}s both`
            }}>
              <div style={{
                width: 42, height: 42, background: `${m.color}12`, border: `1px solid ${m.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}>{m.title}</div>
                <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.15em", marginTop: 3 }}>{m.desc.toUpperCase()}</div>
              </div>
              <span style={{ color: m.color, fontSize: 16, opacity: 0.4 }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sticky cart card at bottom ── */}
      {hasCart && (
        <button onClick={onGoCart} style={{
          position: "absolute", bottom: 20, left: 20, right: 20,
          background: "#f0f0e8", border: "none",
          padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", zIndex: 50,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          animation: "slideUp 0.3s ease both"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16 }}>🛒</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#000", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em" }}>
                {cart.length} ITEM{cart.length !== 1 ? "S" : ""} IN CART
              </div>
              <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace", marginTop: 2, letterSpacing: "0.1em" }}>
                {fmt(cartTotal)} total
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#000", letterSpacing: "0.15em" }}>
            CHECKOUT ›
          </div>
        </button>
      )}

      {/* ── Top-up sheet ── */}
      {showTopUp && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end"
        }}>
          <div style={{ background: "#080f09", borderTop: "1px solid #1a2a1c", borderRadius: "20px 20px 0 0", padding: "24px 24px 48px" }}>
            <div style={{ width: 36, height: 4, background: "#1a2a1c", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.3em", marginBottom: 6 }}>ADD FUNDS</div>
            <div style={{ fontSize: 20, color: "#f0f0e8", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px", marginBottom: 8 }}>How much?</div>
            <div style={{ background: "#0d1a0f", border: "1px solid #1a2a1c", padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#2a4a2a", letterSpacing: "0.2em", marginBottom: 6 }}>TRANSFER TO</div>
              <div style={{ fontSize: 16, color: "#f0f0e8", letterSpacing: "0.1em" }}>{accountNumber}</div>
              <div style={{ fontSize: 9, color: "#3a5c3a", marginTop: 4 }}>PROVIDUS BANK · BAZA NG LTD</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[5000, 10000, 20000, 50000].map(a => (
                <button key={a} onClick={() => setSelectedAmt(a)} style={{
                  padding: "13px 0", background: selectedAmt === a ? "#4caf7d18" : "transparent",
                  border: selectedAmt === a ? "1px solid #4caf7d66" : "1px solid #1a2a1c",
                  color: selectedAmt === a ? "#4caf7d" : "#5a8a5a",
                  fontSize: 13, cursor: "pointer", fontFamily: "monospace"
                }}>{fmt(a)}</button>
              ))}
            </div>
            <button onClick={doTopUp} style={{
              width: "100%", padding: "15px", fontFamily: "monospace",
              background: selectedAmt ? "#4caf7d" : "#1a2a1c",
              border: "none", color: selectedAmt ? "#000" : "#2a3a2a",
              fontSize: 11, letterSpacing: "0.3em", cursor: selectedAmt ? "pointer" : "default",
              fontWeight: 700, marginBottom: 10, transition: "all 0.2s"
            }}>{selectedAmt ? `CONFIRM ${fmt(selectedAmt)}` : "SELECT AMOUNT"}</button>
            <button onClick={() => { setShowTopUp(false); setSelectedAmt(null); }} style={{
              width: "100%", padding: "12px", background: "transparent",
              border: "none", color: "#2a3a2a", fontSize: 10,
              letterSpacing: "0.2em", cursor: "pointer", fontFamily: "monospace"
            }}>CANCEL</button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
