// Baza.ng — Database Seed File
// Run: npx ts-node prisma/seed.ts
// Seeds all product data: bundles, meal packs, ready eat items, snack items, restock products
// ALL PRICES IN KOBO (₦1 = 100 kobo)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Baza.ng database...');

  // ── Products (used in bundles and Shop Your List) ─────────────────────────
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      // Breakfast bundle items
      { id: 'i1',  name: 'Rolled Oats 1kg',          brand: 'Quaker',        emoji: '🌾', price: 180000,  category: 'Grains' },
      { id: 'i2',  name: 'Eggs (crate of 30)',        brand: 'Farm Fresh',    emoji: '🥚', price: 280000,  category: 'Protein' },
      { id: 'i3',  name: 'Sliced Bread',              brand: 'Butterfield',   emoji: '🍞', price: 90000,   category: 'Staples' },
      { id: 'i4',  name: 'Peak Milk (sachet ×12)',    brand: 'Peak',          emoji: '🥛', price: 340000,  category: 'Dairy' },
      { id: 'i5',  name: 'Lipton Tea (×50 bags)',     brand: 'Lipton',        emoji: '🍵', price: 120000,  category: 'Staples' },
      { id: 'i6',  name: 'Wildflower Honey 500g',     brand: 'Osuji',         emoji: '🍯', price: 260000,  category: 'Staples' },
      { id: 'i7',  name: 'Butter 250g',               brand: 'Anchor',        emoji: '🧈', price: 190000,  category: 'Dairy' },
      { id: 'i8',  name: 'Strawberry Jam 340g',       brand: 'Hartley\'s',    emoji: '🍓', price: 180000,  category: 'Staples' },
      // Protein bundle items
      { id: 'p1',  name: 'Chicken (whole, 1.5kg)',    brand: 'Farm Fresh',    emoji: '🍗', price: 480000,  category: 'Protein' },
      { id: 'p2',  name: 'Beef (1kg)',                brand: 'Local Farm',    emoji: '🥩', price: 520000,  category: 'Protein' },
      { id: 'p3',  name: 'Fresh Tilapia (1kg)',       brand: 'Local Farm',    emoji: '🐟', price: 360000,  category: 'Protein' },
      { id: 'p4',  name: 'Eggs (crate of 30)',        brand: 'Farm Fresh',    emoji: '🥚', price: 280000,  category: 'Protein' },
      { id: 'p5',  name: 'Black-eyed Beans 1kg',      brand: 'Local',         emoji: '🫘', price: 220000,  category: 'Protein' },
      { id: 'p6',  name: 'Groundnuts 500g',           brand: 'Local',         emoji: '🥜', price: 140000,  category: 'Protein' },
      // Pantry staples bundle items
      { id: 's1',  name: 'Golden Penny Rice 5kg',     brand: 'Golden Penny',  emoji: '🌾', price: 720000,  category: 'Grains' },
      { id: 's2',  name: 'Garri (Ijebu) 5kg',        brand: 'Farm Fresh',    emoji: '🌽', price: 450000,  category: 'Grains' },
      { id: 's3',  name: 'Flour 2kg',                 brand: 'Honeywell',     emoji: '🌫️', price: 210000,  category: 'Grains' },
      { id: 's4',  name: 'Vegetable Oil 5L',          brand: 'Kings',         emoji: '🫙', price: 810000,  category: 'Cooking' },
      { id: 's5',  name: 'Tomato Paste ×6 cans',      brand: 'Gino',          emoji: '🍅', price: 210000,  category: 'Cooking' },
      { id: 's6',  name: 'Maggi Cubes ×50',           brand: 'Maggi',         emoji: '🧂', price: 95000,   category: 'Seasoning' },
      { id: 's7',  name: 'Table Salt 1kg',            brand: 'Dangote',       emoji: '🧂', price: 55000,   category: 'Seasoning' },
      { id: 's8',  name: 'Dangote Sugar 2kg',         brand: 'Dangote',       emoji: '🍬', price: 320000,  category: 'Staples' },
      { id: 's9',  name: 'Semolina 1kg',              brand: 'Honeywell',     emoji: '🟡', price: 180000,  category: 'Grains' },
      { id: 's10', name: 'Indomie Noodles ×40',       brand: 'Indomie',       emoji: '🍜', price: 480000,  category: 'Grains' },
      // Beverage bundle items
      { id: 'v1',  name: 'Eva Water 75cl ×12',        brand: 'Eva',           emoji: '💧', price: 180000,  category: 'Drinks' },
      { id: 'v2',  name: 'Malt (Big Stout) ×6',       brand: 'Big Stout',     emoji: '🍺', price: 240000,  category: 'Drinks' },
      { id: 'v3',  name: 'Chivita Juice 1L ×4',       brand: 'Chivita',       emoji: '🧃', price: 320000,  category: 'Drinks' },
      { id: 'v4',  name: 'Coca-Cola 50cl ×12',        brand: 'Coca-Cola',     emoji: '🥤', price: 360000,  category: 'Drinks' },
      { id: 'v5',  name: 'Sprite 50cl ×12',           brand: 'Sprite',        emoji: '🥤', price: 340000,  category: 'Drinks' },
      { id: 'v6',  name: 'Hollandia Yoghurt ×6',      brand: 'Hollandia',     emoji: '🍶', price: 280000,  category: 'Dairy' },
      // Restock-specific products
      { id: 'r1',  name: 'Indomie Noodles ×40',       brand: 'Indomie',       emoji: '🍜', price: 480000,  category: 'Grains' },
      { id: 'r2',  name: 'Indomie Noodles ×10',       brand: 'Indomie',       emoji: '🍜', price: 135000,  category: 'Grains' },
      { id: 'r3',  name: 'Peak Milk ×12 sachet',      brand: 'Peak',          emoji: '🥛', price: 340000,  category: 'Dairy' },
      { id: 'r4',  name: 'Peak Milk ×6 sachet',       brand: 'Peak',          emoji: '🥛', price: 175000,  category: 'Dairy' },
      { id: 'r5',  name: 'Vegetable Oil 5L',          brand: 'Kings',         emoji: '🫙', price: 810000,  category: 'Cooking' },
      { id: 'r6',  name: 'Vegetable Oil 2L',          brand: 'Kings',         emoji: '🫙', price: 360000,  category: 'Cooking' },
      { id: 'r7',  name: 'Golden Penny Rice 5kg',     brand: 'Golden Penny',  emoji: '🌾', price: 720000,  category: 'Grains' },
      { id: 'r8',  name: 'Golden Penny Rice 10kg',    brand: 'Golden Penny',  emoji: '🌾', price: 1380000, category: 'Grains' },
      { id: 'r9',  name: 'Maggi Cubes ×50',           brand: 'Maggi',         emoji: '🧂', price: 95000,   category: 'Seasoning' },
      { id: 'r10', name: 'Gino Tomato Paste ×6',      brand: 'Gino',          emoji: '🍅', price: 210000,  category: 'Cooking' },
      { id: 'r11', name: 'Garri (Ijebu) 5kg',        brand: 'Farm Fresh',    emoji: '🌽', price: 450000,  category: 'Grains' },
      { id: 'r12', name: 'Dangote Sugar 2kg',         brand: 'Dangote',       emoji: '🍬', price: 320000,  category: 'Staples' },
      { id: 'r13', name: 'Semolina 1kg',              brand: 'Honeywell',     emoji: '🟡', price: 180000,  category: 'Grains' },
      { id: 'r14', name: 'Semolina 5kg',              brand: 'Honeywell',     emoji: '🟡', price: 850000,  category: 'Grains' },
      { id: 'r15', name: 'Wheat Flour 2kg',           brand: 'Honeywell',     emoji: '🌫️', price: 210000,  category: 'Grains' },
      { id: 'r20', name: 'Chicken (whole, 1.5kg)',    brand: 'Farm Fresh',    emoji: '🍗', price: 480000,  category: 'Protein' },
      { id: 'r21', name: 'Beef 1kg',                  brand: 'Local Farm',    emoji: '🥩', price: 520000,  category: 'Protein' },
      { id: 'r22', name: 'Fresh Tilapia 1kg',         brand: 'Local Farm',    emoji: '🐟', price: 360000,  category: 'Protein' },
      { id: 'r23', name: 'Titus Mackerel ×6 cans',   brand: 'Titus',         emoji: '🐟', price: 420000,  category: 'Protein' },
      { id: 'r24', name: 'Eggs ×30',                  brand: 'Farm Fresh',    emoji: '🥚', price: 450000,  category: 'Protein' },
      { id: 'r25', name: 'Eggs ×12',                  brand: 'Farm Fresh',    emoji: '🥚', price: 195000,  category: 'Protein' },
      { id: 'r26', name: 'Black-eyed Beans 1kg',      brand: 'Local',         emoji: '🫘', price: 220000,  category: 'Protein' },
      { id: 'r27', name: 'Black-eyed Beans 5kg',      brand: 'Local',         emoji: '🫘', price: 1050000, category: 'Protein' },
      { id: 'r30', name: 'Palm Oil 1L',               brand: 'Buka Fresh',    emoji: '🧡', price: 240000,  category: 'Cooking' },
      { id: 'r31', name: 'Palm Oil 4L',               brand: 'Buka Fresh',    emoji: '🧡', price: 880000,  category: 'Cooking' },
      { id: 'r32', name: 'Tomato Stew (frozen, 1kg)', brand: 'Baza Kitchen',  emoji: '🍅', price: 290000,  category: 'Cooking' },
      { id: 'r33', name: 'Crayfish (ground) 100g',    brand: 'Local',         emoji: '🦐', price: 110000,  category: 'Cooking' },
      { id: 'r40', name: 'Knorr Chicken ×50',         brand: 'Knorr',         emoji: '🧂', price: 105000,  category: 'Seasoning' },
      { id: 'r41', name: 'Cameroon Pepper 100g',      brand: 'Local',         emoji: '🌶️', price: 75000,   category: 'Seasoning' },
      { id: 'r42', name: 'Curry Powder 100g',         brand: 'Doyin',         emoji: '🟡', price: 65000,   category: 'Seasoning' },
      { id: 'r43', name: 'Thyme 50g',                 brand: 'Doyin',         emoji: '🌿', price: 55000,   category: 'Seasoning' },
      { id: 'r44', name: 'Table Salt 1kg',            brand: 'Dangote',       emoji: '🧂', price: 55000,   category: 'Seasoning' },
      { id: 'r50', name: 'Butter 250g',               brand: 'Anchor',        emoji: '🧈', price: 210000,  category: 'Dairy' },
      { id: 'r51', name: 'Hollandia Yoghurt 500ml',   brand: 'Hollandia',     emoji: '🥛', price: 140000,  category: 'Dairy' },
      { id: 'r60', name: 'Dangote Sugar 5kg',         brand: 'Dangote',       emoji: '🍬', price: 780000,  category: 'Staples' },
      { id: 'r61', name: 'Milo 200g',                 brand: 'Nestlé',        emoji: '☕', price: 190000,  category: 'Staples' },
      { id: 'r62', name: 'Milo 400g',                 brand: 'Nestlé',        emoji: '☕', price: 360000,  category: 'Staples' },
      { id: 'r63', name: 'Lipton Yellow Label ×100',  brand: 'Lipton',        emoji: '🍵', price: 120000,  category: 'Staples' },
      { id: 'r64', name: 'Nescafé 50g',               brand: 'Nescafé',       emoji: '☕', price: 240000,  category: 'Staples' },
      { id: 'r70', name: 'Ariel Washing Powder 1kg',  brand: 'Ariel',         emoji: '🧺', price: 280000,  category: 'Household' },
      { id: 'r71', name: 'Omo Detergent 500g',        brand: 'Omo',           emoji: '🧺', price: 140000,  category: 'Household' },
      { id: 'r72', name: 'Izal Disinfectant 750ml',   brand: 'Izal',          emoji: '🧴', price: 190000,  category: 'Household' },
      { id: 'r73', name: 'Sponge + Scrub ×3',         brand: 'Local',         emoji: '🧽', price: 60000,   category: 'Household' },
      { id: 'r74', name: 'Toilet Rolls ×12',          brand: 'Innoson',       emoji: '🧻', price: 220000,  category: 'Household' },
      { id: 'r75', name: 'Hand Wash Refill 500ml',    brand: 'Dettol',        emoji: '🧴', price: 170000,  category: 'Household' },
    ],
  });
  console.log('✓ Products seeded');

  // ── Stock Up Bundles ───────────────────────────────────────────────────────
  const bundles = [
    {
      id: 'b1', name: 'Breakfast Bundle', emoji: '🌅', color: '#f5a623',
      description: 'Everything for a solid week of breakfasts', basePrice: 1840000, savings: 22,
      tags: ['Feeds 4', '7 days'],
      items: [
        { productId: 'i1', defaultQty: 1, minQty: 0, maxQty: 5 },
        { productId: 'i2', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'i3', defaultQty: 2, minQty: 0, maxQty: 6 },
        { productId: 'i4', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'i5', defaultQty: 1, minQty: 0, maxQty: 3 },
        { productId: 'i6', defaultQty: 1, minQty: 0, maxQty: 3 },
        { productId: 'i7', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'i8', defaultQty: 1, minQty: 0, maxQty: 3 },
      ],
    },
    {
      id: 'b2', name: 'Protein Pack', emoji: '💪', color: '#e85c3a',
      description: 'High-protein essentials, freezer-ready', basePrice: 2480000, savings: 18,
      tags: ['High protein', 'Freezer-ready'],
      items: [
        { productId: 'p1', defaultQty: 1, minQty: 0, maxQty: 5 },
        { productId: 'p2', defaultQty: 1, minQty: 0, maxQty: 5 },
        { productId: 'p3', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'p4', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'p5', defaultQty: 1, minQty: 0, maxQty: 6 },
        { productId: 'p6', defaultQty: 1, minQty: 0, maxQty: 6 },
      ],
    },
    {
      id: 'b3', name: 'Pantry Staples', emoji: '🏠', color: '#4caf7d',
      description: 'The foundation. Monthly stock for a full house.', basePrice: 3120000, savings: 25,
      tags: ['Monthly stock', 'Most popular'],
      items: [
        { productId: 's1', defaultQty: 1, minQty: 0, maxQty: 5 },
        { productId: 's2', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 's3', defaultQty: 1, minQty: 0, maxQty: 6 },
        { productId: 's4', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 's5', defaultQty: 1, minQty: 0, maxQty: 5 },
        { productId: 's6', defaultQty: 2, minQty: 0, maxQty: 8 },
        { productId: 's7', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 's8', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 's9', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 's10', defaultQty: 1, minQty: 0, maxQty: 3 },
      ],
    },
    {
      id: 'b4', name: 'Beverage Box', emoji: '🧃', color: '#6ec6ff',
      description: 'Drinks for the whole house, mixed and ready', basePrice: 1460000, savings: 20,
      tags: ['Mixed', 'Chilled ready'],
      items: [
        { productId: 'v1', defaultQty: 1, minQty: 0, maxQty: 8 },
        { productId: 'v2', defaultQty: 1, minQty: 0, maxQty: 6 },
        { productId: 'v3', defaultQty: 1, minQty: 0, maxQty: 5 },
        { productId: 'v4', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'v5', defaultQty: 1, minQty: 0, maxQty: 4 },
        { productId: 'v6', defaultQty: 1, minQty: 0, maxQty: 4 },
      ],
    },
  ];

  for (const bundle of bundles) {
    const { items, ...bundleData } = bundle;
    await prisma.bundle.upsert({
      where: { id: bundle.id },
      update: {},
      create: {
        ...bundleData,
        items: { create: items },
      },
    });
  }
  console.log('✓ Bundles seeded');

  // ── Meal Packs ─────────────────────────────────────────────────────────────
  const mealPacks = [
    {
      id: 'm1', name: 'Jollof Pack', emoji: '🍚', baseTime: 45, basePlates: 4,
      basePrice: 890000, color: '#e85c3a', description: 'Everything for a full pot of party jollof',
      ingredients: [
        { name: 'Long grain rice',  emoji: '🌾', unit: 'cups',    perPlate: 0.5,  pricePerPlate: 45000 },
        { name: 'Fresh tomatoes',   emoji: '🍅', unit: 'pcs',     perPlate: 1.5,  pricePerPlate: 20000 },
        { name: 'Tatashe peppers',  emoji: '🫑', unit: 'pcs',     perPlate: 0.5,  pricePerPlate: 15000 },
        { name: 'Scotch bonnet',    emoji: '🌶️', unit: 'pcs',     perPlate: 0.25, pricePerPlate: 8000 },
        { name: 'Chicken',          emoji: '🍗', unit: 'pieces',  perPlate: 1,    pricePerPlate: 95000 },
        { name: 'Seasoning cube',   emoji: '🧂', unit: 'cubes',   perPlate: 0.5,  pricePerPlate: 5000 },
        { name: 'Vegetable oil',    emoji: '🫙', unit: 'tbsp',    perPlate: 2,    pricePerPlate: 12000 },
        { name: 'Onions',           emoji: '🧅', unit: 'medium',  perPlate: 0.5,  pricePerPlate: 7500 },
      ],
    },
    {
      id: 'm2', name: 'Egusi Soup Pack', emoji: '🥣', baseTime: 60, basePlates: 4,
      basePrice: 1120000, color: '#f5a623', description: 'A proper Sunday soup, all in one bag',
      ingredients: [
        { name: 'Egusi seeds',      emoji: '🟡', unit: 'cups',     perPlate: 0.5,  pricePerPlate: 60000 },
        { name: 'Pumpkin leaves',   emoji: '🌿', unit: 'handfuls', perPlate: 1,    pricePerPlate: 15000 },
        { name: 'Beef',             emoji: '🥩', unit: 'pieces',   perPlate: 2,    pricePerPlate: 110000 },
        { name: 'Stockfish',        emoji: '🐟', unit: 'pieces',   perPlate: 0.5,  pricePerPlate: 40000 },
        { name: 'Palm oil',         emoji: '🫙', unit: 'tbsp',     perPlate: 2,    pricePerPlate: 13000 },
        { name: 'Crayfish',         emoji: '🦐', unit: 'tbsp',     perPlate: 1,    pricePerPlate: 20000 },
        { name: 'Peppers',          emoji: '🌶️', unit: 'pcs',      perPlate: 0.75, pricePerPlate: 10000 },
        { name: 'Onions',           emoji: '🧅', unit: 'medium',   perPlate: 0.5,  pricePerPlate: 12000 },
      ],
    },
    {
      id: 'm3', name: 'Okro Pack', emoji: '🫛', baseTime: 30, basePlates: 3,
      basePrice: 740000, color: '#4caf7d', description: 'Quick, fresh, goes well with anything',
      ingredients: [
        { name: 'Fresh okro',  emoji: '🫛', unit: 'pcs',    perPlate: 8,    pricePerPlate: 70000 },
        { name: 'Shrimp',      emoji: '🦐', unit: 'handfuls', perPlate: 1,  pricePerPlate: 90000 },
        { name: 'Beef',        emoji: '🥩', unit: 'pieces', perPlate: 2,    pricePerPlate: 110000 },
        { name: 'Palm oil',    emoji: '🫙', unit: 'tbsp',   perPlate: 1.5,  pricePerPlate: 13000 },
        { name: 'Peppers',     emoji: '🌶️', unit: 'pcs',    perPlate: 0.5,  pricePerPlate: 8000 },
        { name: 'Crayfish',    emoji: '🦐', unit: 'tbsp',   perPlate: 0.75, pricePerPlate: 20000 },
      ],
    },
    {
      id: 'm4', name: 'Fried Rice Pack', emoji: '🍳', baseTime: 50, basePlates: 4,
      basePrice: 960000, color: '#ffe082', description: 'Smoky, rich, restaurant quality at home',
      ingredients: [
        { name: 'Parboiled rice',     emoji: '🌾', unit: 'cups',   perPlate: 0.5, pricePerPlate: 43000 },
        { name: 'Mixed vegetables',   emoji: '🥦', unit: 'cups',   perPlate: 0.5, pricePerPlate: 35000 },
        { name: 'Chicken liver',      emoji: '🍗', unit: 'pieces', perPlate: 2,   pricePerPlate: 80000 },
        { name: 'Eggs',               emoji: '🥚', unit: 'pcs',    perPlate: 1,   pricePerPlate: 22000 },
        { name: 'Soy sauce',          emoji: '🍶', unit: 'tbsp',   perPlate: 1,   pricePerPlate: 12000 },
        { name: 'Butter',             emoji: '🧈', unit: 'tbsp',   perPlate: 1,   pricePerPlate: 15000 },
        { name: 'Green onions',       emoji: '🌿', unit: 'stalks', perPlate: 2,   pricePerPlate: 8000 },
      ],
    },
  ];

  for (const pack of mealPacks) {
    const { ingredients, ...packData } = pack;
    await prisma.mealPack.upsert({
      where: { id: pack.id },
      update: {},
      create: {
        ...packData,
        ingredients: { create: ingredients },
      },
    });
  }
  console.log('✓ Meal packs seeded');

  // ── Ready to Eat Items ─────────────────────────────────────────────────────
  await prisma.readyEatItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 're1', name: 'Jollof Rice + Chicken',        kitchen: "Mama Titi's Kitchen",  emoji: '🍛', price: 380000, oldPrice: 450000, deliveryTime: '20–35 min', tags: ['Bestseller', 'Spicy available'], description: 'Party jollof, smoky and rich. Comes with a full chicken leg.', color: '#e85c3a' },
      { id: 're2', name: 'Egusi + Eba',                  kitchen: 'Iya Beji Buka',        emoji: '🥣', price: 320000, oldPrice: null,   deliveryTime: '15–25 min', tags: ['Homestyle', 'No MSG'],          description: 'Traditional egusi with fresh pumpkin leaves. Eba included.', color: '#f5a623' },
      { id: 're3', name: 'Peppered Snail',               kitchen: 'Chop Life Lagos',      emoji: '🐌', price: 540000, oldPrice: 600000, deliveryTime: '25–40 min', tags: ['Premium', 'Weekend special'],   description: 'Full pepper sauce, grilled finish. Comes with sliced bread.', color: '#c77dff' },
      { id: 're4', name: 'Fried Rice + Moi Moi',         kitchen: 'Madam Kemi',           emoji: '🍳', price: 350000, oldPrice: null,   deliveryTime: '20–30 min', tags: ['Family favourite'],             description: 'Golden fried rice with two wraps of moi moi. Pure comfort.', color: '#ffe082' },
      { id: 're5', name: 'Suya Platter (500g)',          kitchen: 'Mallam Sule Suya',     emoji: '🍢', price: 420000, oldPrice: 500000, deliveryTime: '15–20 min', tags: ['Grilled fresh', 'Comes with onions'], description: 'Beef and chicken suya. Served with sliced onion and groundnut.', color: '#e85c3a' },
      { id: 're6', name: 'Amala + Gbegiri + Ewedu',     kitchen: 'Iya Beji Buka',        emoji: '🫙', price: 290000, oldPrice: null,   deliveryTime: '10–20 min', tags: ['Classic Lagos', 'Quick'],       description: 'Abula in full effect. The combo that never misses.', color: '#4caf7d' },
    ],
  });
  console.log('✓ Ready to Eat items seeded');

  // ── Snacks & Drinks Items ──────────────────────────────────────────────────
  await prisma.snackItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'q1',  name: 'Egg Roll × 2',              emoji: '🥚', price: 80000,  category: 'Snacks', tag: 'Hot & fresh',              color: '#f5a623' },
      { id: 'q2',  name: 'Agege Bread (sliced)',       emoji: '🍞', price: 65000,  category: 'Breads', tag: 'Baked today',              color: '#c8843a' },
      { id: 'q3',  name: 'Strawberry Smoothie 500ml', emoji: '🍓', price: 180000, category: 'Drinks', tag: 'No sugar added',            color: '#e85c3a' },
      { id: 'q4',  name: 'Green Smoothie 500ml',      emoji: '🥦', price: 190000, category: 'Drinks', tag: 'Spinach, cucumber, apple',  color: '#4caf7d' },
      { id: 'q5',  name: 'Puff Puff × 6',             emoji: '🟡', price: 60000,  category: 'Snacks', tag: 'Warm',                     color: '#f5a623' },
      { id: 'q6',  name: 'Scotch Egg × 2',            emoji: '🥚', price: 110000, category: 'Snacks', tag: 'Freshly made',              color: '#c8843a' },
      { id: 'q7',  name: 'Banana Bread slice',        emoji: '🍌', price: 75000,  category: 'Breads', tag: 'Homemade',                  color: '#ffe082' },
      { id: 'q8',  name: 'Mango Lassi 350ml',         emoji: '🥭', price: 160000, category: 'Drinks', tag: 'Chilled',                   color: '#f5a623' },
      { id: 'q9',  name: 'Meat Pie × 2',              emoji: '🫓', price: 120000, category: 'Snacks', tag: 'Just out the oven',         color: '#c8843a' },
      { id: 'q10', name: 'Coconut Bread (half loaf)', emoji: '🥥', price: 90000,  category: 'Breads', tag: 'Soft & sweet',              color: '#ffe082' },
      { id: 'q11', name: 'Zobo Drink 500ml',          emoji: '🍷', price: 70000,  category: 'Drinks', tag: 'Cold, no preservatives',    color: '#e85c3a' },
      { id: 'q12', name: 'Chin Chin 200g',            emoji: '🟤', price: 55000,  category: 'Snacks', tag: 'Crunchy',                   color: '#c8843a' },
    ],
  });
  console.log('✓ Snacks & Drinks items seeded');

  console.log('\n✅ Baza.ng database seeded successfully!');
  console.log('   Products: 72 | Bundles: 4 | Meal Packs: 4 | Ready to Eat: 6 | Snacks: 12');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
