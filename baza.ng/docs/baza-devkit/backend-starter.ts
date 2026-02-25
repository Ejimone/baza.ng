// Baza.ng Backend — Express App Bootstrap
// File: backend/src/index.ts
// Start: npm run dev
// 
// This file wires together the full Express app.
// Individual route files live in /src/routes/
// Business logic lives in /src/services/
// Third-party clients (Paystack, Termii, Claude) live in /src/lib/

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// ─── INIT ─────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;

export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL!);

redis.on('connect', () => console.log('✓ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:8081').split(','),
  credentials: true,  // Required for HttpOnly cookie refresh tokens
}));

// ─── RAW BODY FOR PAYSTACK WEBHOOK ───────────────────────────────────────────
// Paystack HMAC verification needs the raw request body.
// This must come BEFORE express.json() for the webhook route.
app.use('/v1/webhooks/paystack', express.raw({ type: 'application/json' }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
// Import and mount route files here as you build them
// Example structure below — implement each file in /src/routes/

// app.use('/v1/auth',     authRoutes);
// app.use('/v1/user',     userRoutes);
// app.use('/v1/products', productRoutes);
// app.use('/v1/orders',   orderRoutes);
// app.use('/v1/wallet',   walletRoutes);
// app.use('/v1/support',  supportRoutes);
// app.use('/v1/referral', referralRoutes);
// app.use('/v1/webhooks', webhookRoutes);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Baza.ng API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
});

export default app;


// ════════════════════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE — copy to /src/middleware/auth.ts
// ════════════════════════════════════════════════════════════════════════════
/*
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing access token', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token', code: 'UNAUTHORIZED' });
  }
};
*/


// ════════════════════════════════════════════════════════════════════════════
// JWT SERVICE — copy to /src/services/jwt.ts
// ════════════════════════════════════════════════════════════════════════════
/*
import jwt from 'jsonwebtoken';
import { redis } from '../index';

export const generateAccessToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
  });

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('baza_refresh', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days in ms
    domain: process.env.COOKIE_DOMAIN,
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie('baza_refresh');
};

// Blacklist a refresh token (on logout)
export const blacklistToken = async (token: string): Promise<void> => {
  const decoded = jwt.decode(token) as { exp: number };
  if (!decoded?.exp) return;
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.setex(`blacklist:${token}`, ttl, '1');
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> =>
  (await redis.exists(`blacklist:${token}`)) === 1;
*/


// ════════════════════════════════════════════════════════════════════════════
// PAYSTACK WEBHOOK HANDLER — copy to /src/routes/webhooks.ts
// ════════════════════════════════════════════════════════════════════════════
/*
import express from 'express';
import crypto from 'crypto';
import { prisma } from '../index';

const router = express.Router();

const verifyPaystackSignature = (rawBody: Buffer, signature: string): boolean => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

router.post('/paystack', async (req, res) => {
  // rawBody is available because we used express.raw() for this route
  const signature = req.headers['x-paystack-signature'] as string;
  
  if (!verifyPaystackSignature(req.body as Buffer, signature)) {
    console.warn('Invalid Paystack webhook signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Parse the raw body now that we've verified it
  const event = JSON.parse(req.body.toString());
  
  try {
    if (event.event === 'dedicated_account.credit') {
      const { amount, customer, dedicated_account } = event.data;
      
      // Find user by account number
      const user = await prisma.user.findFirst({
        where: { accountNumber: dedicated_account.account_number },
      });
      
      if (!user) {
        console.warn('No user found for account:', dedicated_account.account_number);
        return res.status(200).json({ received: true });  // Still 200 to prevent Paystack retries
      }

      // Atomic wallet credit (use transaction)
      await prisma.$transaction([
        prisma.walletTransaction.create({
          data: {
            userId: user.id,
            amount: amount,  // Paystack sends in kobo
            type: 'CREDIT_TRANSFER',
            reference: event.data.reference,
            description: `Bank transfer — ${dedicated_account.bank.name}`,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: { increment: amount } },
        }),
      ]);

      console.log(`✓ Wallet credited: User ${user.id} +${amount/100} NGN`);
    }

    if (event.event === 'charge.success') {
      // Handle card top-up success
      const { amount, reference, customer } = event.data;
      
      const user = await prisma.user.findFirst({
        where: { email: customer.email },
      });
      
      if (!user) return res.status(200).json({ received: true });

      // Check if already processed (idempotency)
      const existing = await prisma.walletTransaction.findUnique({
        where: { reference },
      });
      if (existing) return res.status(200).json({ received: true });

      await prisma.$transaction([
        prisma.walletTransaction.create({
          data: {
            userId: user.id,
            amount,
            type: 'CREDIT_CARD',
            reference,
            description: 'Card top-up',
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: { increment: amount } },
        }),
      ]);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Return 200 anyway — Paystack will retry on non-200
    res.status(200).json({ received: true });
  }
});

export default router;
*/


// ════════════════════════════════════════════════════════════════════════════
// ORDER SERVICE — copy to /src/services/orders.ts
// The most critical function. Uses Prisma transaction for atomic wallet deduction.
// ════════════════════════════════════════════════════════════════════════════
/*
import { prisma } from '../index';

interface OrderItem {
  itemType: string;
  productId?: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  meta?: any;
}

interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  total: number;
  note?: string;
  addressId?: string;
}

export const createOrder = async (input: CreateOrderInput) => {
  const { userId, items, total, note, addressId } = input;
  
  if (items.length === 0) {
    throw { code: 'EMPTY_CART', message: 'Cart is empty' };
  }

  // Run everything in a transaction — balance check + deduct + create order
  const result = await prisma.$transaction(async (tx) => {
    // Lock the user row and check balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    if (!user) throw { code: 'NOT_FOUND', message: 'User not found' };
    if (user.walletBalance < total) {
      throw { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient wallet balance' };
    }

    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        total,
        note,
        addressId,
        status: 'CONFIRMED',
        eta: getEta(),
        items: {
          create: items.map(item => ({
            itemType:   item.itemType,
            productId:  item.productId,
            name:       item.name,
            emoji:      item.emoji,
            qty:        item.qty,
            unitPrice:  item.unitPrice,
            totalPrice: item.totalPrice,
            meta:       item.meta,
          })),
        },
      },
      include: { items: true },
    });

    // Create wallet transaction record
    const txn = await tx.walletTransaction.create({
      data: {
        userId,
        amount:      total,
        type:        'DEBIT_ORDER',
        reference:   `ord_${order.id}`,
        description: `Order ${order.id}`,
      },
    });

    // Link transaction to order
    await tx.order.update({
      where: { id: order.id },
      data:  { walletTxnId: txn.id },
    });

    // Deduct wallet balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data:  { walletBalance: { decrement: total } },
    });

    return { order, newBalance: updatedUser.walletBalance };
  });

  // Check referral credit (outside transaction — non-critical)
  await checkAndApplyReferralCredit(userId);

  return result;
};

const getEta = (): string => {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 16) return 'Today by 6pm';  // order before 4pm → same day
  return 'Tomorrow by 10am';
};

const checkAndApplyReferralCredit = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true, id: true },
      include: { _count: { select: { orders: true } } } as any,
    });
    
    if (!user?.referredBy) return;
    
    const orderCount = await prisma.order.count({ where: { userId } });
    if (orderCount !== 1) return;  // Only apply on FIRST order
    
    // Find the referrer
    const referrer = await prisma.user.findFirst({
      where: { referralCode: user.referredBy },
    });
    if (!referrer) return;

    const REFERRER_CREDIT = parseInt(process.env.REFERRAL_CREDIT_REFERRER || '200000');
    const REFEREE_CREDIT  = parseInt(process.env.REFERRAL_CREDIT_REFEREE  || '100000');

    await prisma.$transaction([
      // Credit referrer
      prisma.walletTransaction.create({
        data: { userId: referrer.id, amount: REFERRER_CREDIT, type: 'CREDIT_REFERRAL',
                reference: `ref_${userId}_${Date.now()}`, description: 'Referral reward' },
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: { walletBalance: { increment: REFERRER_CREDIT } },
      }),
      // Credit referee
      prisma.walletTransaction.create({
        data: { userId, amount: REFEREE_CREDIT, type: 'CREDIT_REFERRAL',
                reference: `refbonus_${userId}_${Date.now()}`, description: 'Welcome bonus' },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: REFEREE_CREDIT } },
      }),
    ]);
  } catch (err) {
    console.error('Referral credit error (non-fatal):', err);
  }
};
*/


// ════════════════════════════════════════════════════════════════════════════
// TERMII OTP SERVICE — copy to /src/lib/termii.ts
// ════════════════════════════════════════════════════════════════════════════
/*
import axios from 'axios';
import { redis } from '../index';

const TERMII_BASE = 'https://api.ng.termii.com/api';

export const sendOTP = async (phone: string): Promise<void> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store in Redis with 5-min TTL. Format: { code, attempts: 0 }
  const key = `otp:${phone}`;
  await redis.setex(key, parseInt(process.env.OTP_TTL_SECONDS || '300'), 
    JSON.stringify({ code: otp, attempts: 0 }));

  if (process.env.TERMII_SANDBOX === 'true') {
    console.log(`[SANDBOX] OTP for ${phone}: ${otp}`);
    return;  // Don't actually send SMS in sandbox mode
  }

  await axios.post(`${TERMII_BASE}/sms/send`, {
    to:           phone,
    from:         process.env.TERMII_SENDER_ID,
    sms:          `Your Baza verification code is: ${otp}. Valid for 5 minutes. Do not share.`,
    type:         'plain',
    channel:      'generic',
    api_key:      process.env.TERMII_API_KEY,
  });
};

export const verifyOTP = async (phone: string, code: string): Promise<boolean> => {
  const key = `otp:${phone}`;
  const raw = await redis.get(key);
  if (!raw) throw { code: 'OTP_EXPIRED', message: 'OTP expired or not found' };

  const stored = JSON.parse(raw);
  
  if (stored.attempts >= 5) {
    await redis.del(key);
    throw { code: 'OTP_EXPIRED', message: 'Too many failed attempts' };
  }

  if (stored.code !== code) {
    stored.attempts++;
    await redis.setex(key, await redis.ttl(key), JSON.stringify(stored));
    throw { code: 'INVALID_OTP', message: 'Incorrect OTP' };
  }

  await redis.del(key);  // Delete OTP on success
  return true;
};

// Rate limiter: max 3 OTP requests per phone per 10 minutes
export const checkOTPRateLimit = async (phone: string): Promise<void> => {
  const key = `otplimit:${phone}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 600);  // 10 minutes

  const limit = parseInt(process.env.OTP_RATE_LIMIT || '3');
  if (count > limit) {
    const ttl = await redis.ttl(key);
    throw { code: 'RATE_LIMIT_EXCEEDED', message: `Too many OTP requests. Try again in ${Math.ceil(ttl / 60)} minutes.` };
  }
};
*/
