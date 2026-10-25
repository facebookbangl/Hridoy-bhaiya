import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const SETTINGS_FILE_PATH = path.join(__dirname, 'src', 'data', 'payment-settings.json');
const CREDENTIALS_FILE_PATH = path.join(__dirname, 'src', 'data', '.admin-credentials.json');

const DEFAULT_PAYMENT_SETTINGS = {
  bkash: '01312452160',
  bkashType: 'Personal',
  bkashMethod: 'Send Money',
  nagad: '01869910404',
  nagadType: 'Personal',
  nagadMethod: 'Send Money',
  rocket: '019XXXXXXXX',
  rocketType: 'Personal',
  rocketStatus: 'Coming Soon', // 'Coming Soon' | 'Enabled' | 'Disabled'
  paymentInstructions: [
    'উপলব্ধ পেমেন্ট মেথড (bKash অথবা Nagad) নির্বাচন করুন।',
    'প্রদর্শিত নম্বরের পাশের "Copy Number" বাটনে চাপ দিয়ে নম্বরটি কপি করুন।',
    'আপনার bKash বা Nagad মোবাইল ফিন্যান্সিয়াল সার্ভিস অ্যাপ ওপেন করুন।',
    'Send Money অপশন ব্যবহার করে নির্ধারিত পরিমাণ টাকা ওই নম্বরে পাঠান।',
    'টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ফর্মে সঠিকভাবে লিখুন।',
    'সব তথ্য যাচাই করে "অর্ডার কনফার্ম করুন" বাটনে চাপ দিয়ে সাবমিট সম্পন্ন করুন।'
  ]
};

// Rate limiting & Session security state
interface RateLimitEntry {
  failedCount: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const failedAttempts = new Map<string, RateLimitEntry>();
const activeAdminSessions = new Map<string, AdminSession>();

// Cleanup expired sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeAdminSessions.entries()) {
    if (session.expiresAt <= now) {
      activeAdminSessions.delete(token);
    }
  }
}, 30 * 60 * 1000);

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Server-side admin PIN retrieval
function getSecureAdminPin(): string {
  try {
    if (fs.existsSync(CREDENTIALS_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE_PATH, 'utf-8'));
      if (data && typeof data.pin === 'string' && data.pin.trim().length > 0) {
        return data.pin.trim();
      }
    }
  } catch (err) {
    console.error('Error reading server credentials:', err);
  }
  return process.env.ADMIN_PIN || 'JIBONAMARJAN';
}

// Server-side admin PIN update
function saveSecureAdminPin(newPin: string): boolean {
  try {
    fs.mkdirSync(path.dirname(CREDENTIALS_FILE_PATH), { recursive: true });
    fs.writeFileSync(
      CREDENTIALS_FILE_PATH,
      JSON.stringify({ pin: newPin, updatedAt: new Date().toISOString() }, null, 2),
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error('Error saving server credentials:', err);
    return false;
  }
}

// Helper to read payment settings
function getStoredPaymentSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading payment settings file:', err);
  }
  return DEFAULT_PAYMENT_SETTINGS;
}

// Helper to write payment settings
function savePaymentSettings(settings: any) {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing payment settings file:', err);
    return false;
  }
}

// Middleware: Require Admin Authentication via valid Bearer session token
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  const headerToken = (req.headers['x-admin-token'] as string)?.trim();
  const activeToken = token || headerToken;

  if (!activeToken) {
    return res.status(401).json({
      success: false,
      error: 'অননুমোদিত অনুরোধ! অ্যাডমিন অ্যাক্সেসের জন্য লগইন টোকেন প্রয়োজন।'
    });
  }

  const session = activeAdminSessions.get(activeToken);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'অবৈধ অ্যাডমিন সেশন! দয়া করে পুনরায় অ্যাডমিন পিন দিয়ে লগইন করুন।'
    });
  }

  if (session.expiresAt <= Date.now()) {
    activeAdminSessions.delete(activeToken);
    return res.status(401).json({
      success: false,
      error: 'অ্যাডমিন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।'
    });
  }

  // Extend session activity
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  next();
}

// ---------------------------------------------------------------------------
// PUBLIC APIS
// ---------------------------------------------------------------------------

// Public API: Get Payment Settings (For checkout page only)
app.get('/api/payment-settings', (req: Request, res: Response) => {
  const settings = getStoredPaymentSettings();
  res.json({
    bkash: settings.bkash,
    bkashType: settings.bkashType || 'Personal',
    bkashMethod: settings.bkashMethod || 'Send Money',
    nagad: settings.nagad,
    nagadType: settings.nagadType || 'Personal',
    nagadMethod: settings.nagadMethod || 'Send Money',
    rocketStatus: settings.rocketStatus || 'Coming Soon',
    rocket: settings.rocketStatus === 'Enabled' ? settings.rocket : undefined,
    rocketType: 'Personal',
    paymentInstructions: settings.paymentInstructions || DEFAULT_PAYMENT_SETTINGS.paymentInstructions
  });
});

// In-memory cache for YouTube oEmbed metadata to avoid repeated external requests
const youtubeOEmbedCache = new Map<string, { title: string; author: string; thumbnail: string; fetchedAt: number }>();

app.get('/api/youtube-oembed', async (req: Request, res: Response) => {
  const videoId = String(req.query.id || '').trim();
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Valid 11-character YouTube video ID required' });
  }

  const cached = youtubeOEmbedCache.get(videoId);
  if (cached && (Date.now() - cached.fetchedAt < 24 * 60 * 60 * 1000)) {
    return res.json({ id: videoId, ...cached });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`oEmbed responded with status ${response.status}`);
    }
    const data: any = await response.json();
    const result = {
      title: data.title || '',
      author: data.author_name || 'ZERO POINT FF',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      fetchedAt: Date.now()
    };
    youtubeOEmbedCache.set(videoId, result);
    return res.json({ id: videoId, ...result });
  } catch {
    return res.json({
      id: videoId,
      title: '',
      author: 'ZERO POINT FF',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      fallback: true
    });
  }
});

// ---------------------------------------------------------------------------
// ADMIN AUTHENTICATION APIS (Rate Limited & Server-Side Verified)
// ---------------------------------------------------------------------------

/**
 * POST /api/admin/login
 * Verifies PIN server-side with rate limiting.
 * Returns cryptographically secure Bearer session token.
 */
app.post('/api/admin/login', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const { pin } = req.body;

  let limitEntry = failedAttempts.get(ip);
  if (!limitEntry) {
    limitEntry = { failedCount: 0, lockedUntil: null, lastAttempt: now };
    failedAttempts.set(ip, limitEntry);
  }

  // Check if IP is currently locked out
  if (limitEntry.lockedUntil && limitEntry.lockedUntil > now) {
    const remainingSeconds = Math.ceil((limitEntry.lockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return res.status(429).json({
      success: false,
      error: `অতিরিক্ত ভুল চেষ্টার কারণে অ্যাডমিন প্যানেল সাময়িকভাবে লক রয়েছে। অনুগ্রহ করে ${remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`,
      retryAfterSeconds: remainingSeconds
    });
  }

  // If lockout expired, reset
  if (limitEntry.lockedUntil && limitEntry.lockedUntil <= now) {
    limitEntry.failedCount = 0;
    limitEntry.lockedUntil = null;
  }

  const cleanPin = typeof pin === 'string' ? pin.trim() : '';
  const currentAdminPin = getSecureAdminPin();

  // Validate PIN using constant-time comparison to prevent timing attacks
  const pinBuffer = Buffer.from(cleanPin);
  const targetBuffer = Buffer.from(currentAdminPin);
  const isValid = pinBuffer.length === targetBuffer.length && crypto.timingSafeEqual(pinBuffer, targetBuffer);

  if (!isValid) {
    limitEntry.failedCount += 1;
    limitEntry.lastAttempt = now;

    // Lock out after 5 consecutive failures for 5 minutes
    if (limitEntry.failedCount >= 5) {
      limitEntry.lockedUntil = now + 5 * 60 * 1000;
      return res.status(429).json({
        success: false,
        error: 'Invalid Security PIN. ৫ বার ভুল চেষ্টার কারণে অ্যাডমিন প্যানেল ৫ মিনিটের জন্য লক করা হয়েছে।',
        retryAfterSeconds: 300
      });
    }

    const remainingAttempts = 5 - limitEntry.failedCount;
    return res.status(401).json({
      success: false,
      error: 'Invalid Security PIN',
      remainingAttempts: remainingAttempts
    });
  }

  // PIN verified! Reset rate limit for this IP
  failedAttempts.delete(ip);

  // Generate cryptographically secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const session: AdminSession = {
    token,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000 // 24 hours
  };
  activeAdminSessions.set(token, session);

  return res.json({
    success: true,
    token,
    expiresIn: 86400,
    message: 'এডমিন লগইন সফল হয়েছে!'
  });
});

// Admin API: Verify Active Session
app.get('/api/admin/verify-session', requireAdminAuth, (req: Request, res: Response) => {
  return res.json({ success: true, authorized: true });
});

// Admin API: Logout and Invalidate Session
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  if (token) {
    activeAdminSessions.delete(token);
  }
  return res.json({ success: true, message: 'এডমিন লগআউট সম্পন্ন হয়েছে।' });
});

// Admin API: Change Security PIN (Server-Side Protected)
app.post('/api/admin/change-pin', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPin, newPin } = req.body;
  const cleanCurrent = typeof currentPin === 'string' ? currentPin.trim() : '';
  const cleanNew = typeof newPin === 'string' ? newPin.trim() : '';

  const serverPin = getSecureAdminPin();
  if (cleanCurrent !== serverPin) {
    return res.status(400).json({
      success: false,
      error: 'বর্তমান সিকিউরিটি পিনটি সঠিক নয়।'
    });
  }

  if (cleanNew.length < 4) {
    return res.status(400).json({
      success: false,
      error: 'নতুন সিকিউরিটি পিন কমপক্ষে ৪ অক্ষরের হতে হবে।'
    });
  }

  const saved = saveSecureAdminPin(cleanNew);
  if (!saved) {
    return res.status(500).json({
      success: false,
      error: 'সিকিউরিটি পিন আপডেট করতে ব্যর্থ হয়েছে।'
    });
  }

  return res.json({
    success: true,
    message: 'এডমিন সিকিউরিটি পিন সফলভাবে আপডেট করা হয়েছে!'
  });
});

// ---------------------------------------------------------------------------
// ADMIN PROTECTED DATA APIS
// ---------------------------------------------------------------------------

// Admin API: Get Full Payment Settings (Authenticated)
app.get('/api/admin/payment-settings', requireAdminAuth, (req: Request, res: Response) => {
  const settings = getStoredPaymentSettings();
  res.json({ success: true, settings });
});

// Admin API: Update Payment Settings (Authenticated & Validated)
app.post('/api/admin/payment-settings', requireAdminAuth, (req: Request, res: Response) => {
  const { bkash, nagad, rocket, rocketStatus, paymentInstructions } = req.body;

  // Validate bKash number (11 digits, starts with 01)
  const phoneRegex = /^01[3-9]\d{8}$/;
  const cleanBkash = String(bkash || '').trim();
  const cleanNagad = String(nagad || '').trim();
  const cleanRocket = String(rocket || '').trim();

  if (!phoneRegex.test(cleanBkash)) {
    return res.status(400).json({ 
      error: 'অকার্যকর bKash নম্বর! সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01312452160)।' 
    });
  }

  if (!phoneRegex.test(cleanNagad)) {
    return res.status(400).json({ 
      error: 'অকার্যকর Nagad নম্বর! সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01869910404)।' 
    });
  }

  // Validate rocket status
  const validRocketStatuses = ['Coming Soon', 'Enabled', 'Disabled'];
  const cleanRocketStatus = validRocketStatuses.includes(rocketStatus) ? rocketStatus : 'Coming Soon';

  if (cleanRocketStatus === 'Enabled' && cleanRocket && !phoneRegex.test(cleanRocket)) {
    return res.status(400).json({ 
      error: 'Rocket সচল করতে হলে সঠিক ১১ ডিজিটের নম্বর প্রদান করুন।' 
    });
  }

  const currentSettings = getStoredPaymentSettings();
  const updatedSettings = {
    ...currentSettings,
    bkash: cleanBkash,
    bkashType: 'Personal',
    bkashMethod: 'Send Money',
    nagad: cleanNagad,
    nagadType: 'Personal',
    nagadMethod: 'Send Money',
    rocket: cleanRocket || currentSettings.rocket || '019XXXXXXXX',
    rocketStatus: cleanRocketStatus,
    paymentInstructions: Array.isArray(paymentInstructions) && paymentInstructions.length > 0 
      ? paymentInstructions 
      : currentSettings.paymentInstructions
  };

  const saved = savePaymentSettings(updatedSettings);
  if (!saved) {
    return res.status(500).json({ error: 'পেমেন্ট সেটিংস সেভ করতে ব্যর্থ হয়েছে। সার্ভার স্টোরেজ চেক করুন।' });
  }

  return res.json({ 
    success: true, 
    message: 'পেমেন্ট সেটিংস সফলভাবে সার্ভারে সংরক্ষিত হয়েছে!', 
    settings: updatedSettings 
  });
});

async function startServer() {
  // Mount Vite in development or serve static in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZERO POINT FF Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
