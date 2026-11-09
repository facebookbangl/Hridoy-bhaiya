/**
 * Meta Pixel & Facebook Ads Conversion Tracking Helper
 * Safely initializes and tracks standard Facebook Pixel events
 * with automatic deduplication, SSR guards, and zero console noise when disabled.
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    __metaPixelInitialized?: boolean;
    __metaPixelId?: string;
  }
}

// Track recent events to prevent rapid duplicate firing within 2 seconds
const recentEvents = new Map<string, number>();

function isDeduplicated(eventKey: string, windowMs = 2000): boolean {
  const now = Date.now();
  const lastTime = recentEvents.get(eventKey);
  if (lastTime && now - lastTime < windowMs) {
    return true;
  }
  recentEvents.set(eventKey, now);
  return false;
}

/**
 * Initializes Meta Pixel script with given Pixel ID
 */
export function initMetaPixel(pixelId?: string): void {
  if (typeof window === 'undefined' || !pixelId) return;

  const cleanId = String(pixelId).trim();
  if (!cleanId || !/^\d{6,20}$/.test(cleanId)) return;

  // Avoid re-initialization with same ID
  if (window.__metaPixelInitialized && window.__metaPixelId === cleanId) return;

  try {
    /* eslint-disable */
    if (!window.fbq) {
      const fbq: any = function () {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, arguments);
        } else {
          fbq.queue.push(arguments);
        }
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      window.fbq = fbq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }

    window.fbq('init', cleanId);
    window.__metaPixelInitialized = true;
    window.__metaPixelId = cleanId;

    // Track initial PageView
    trackPixelPageView();
  } catch (err) {
    console.warn('Meta Pixel initialization warning:', err);
  }
}

/**
 * Standard Event: PageView
 */
export function trackPixelPageView(): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (isDeduplicated('PageView', 3000)) return;

  try {
    window.fbq('track', 'PageView');
  } catch {}
}

/**
 * Standard Event: ViewContent (When user views an Account Details)
 */
export function trackPixelViewContent(account: { code: string; title: string; price: number; level?: number }): void {
  if (typeof window === 'undefined' || !window.fbq || !account) return;
  const eventKey = `ViewContent_${account.code}`;
  if (isDeduplicated(eventKey, 2500)) return;

  try {
    window.fbq('track', 'ViewContent', {
      content_name: account.title,
      content_ids: [account.code],
      content_type: 'product',
      value: account.price,
      currency: 'BDT',
    });
  } catch {}
}

/**
 * Standard Event: Search (When user performs an actual search)
 */
export function trackPixelSearch(query: string): void {
  if (typeof window === 'undefined' || !window.fbq || !query || query.trim().length < 2) return;
  const cleanQ = query.trim().toLowerCase();
  const eventKey = `Search_${cleanQ}`;
  if (isDeduplicated(eventKey, 4000)) return;

  try {
    window.fbq('track', 'Search', {
      search_string: cleanQ,
      content_category: 'Free Fire Accounts',
    });
  } catch {}
}

/**
 * Standard Event: Contact (When user initiates WhatsApp contact for support or inquiry)
 */
export function trackPixelContact(purpose: string): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  const eventKey = `Contact_${purpose}`;
  if (isDeduplicated(eventKey, 3000)) return;

  try {
    window.fbq('track', 'Contact', {
      content_name: purpose,
      channel: 'WhatsApp',
    });
  } catch {}
}

/**
 * Standard Event: InitiateCheckout (When user clicks Buy Now or opens checkout modal)
 */
export function trackPixelInitiateCheckout(account: { code: string; title: string; price: number }): void {
  if (typeof window === 'undefined' || !window.fbq || !account) return;
  const eventKey = `InitiateCheckout_${account.code}`;
  if (isDeduplicated(eventKey, 3000)) return;

  try {
    window.fbq('track', 'InitiateCheckout', {
      content_name: account.title,
      content_ids: [account.code],
      content_type: 'product',
      value: account.price,
      currency: 'BDT',
      num_items: 1,
    });
  } catch {}
}

/**
 * Standard Event: Purchase (Only fires upon genuine purchase verification/confirmation submission)
 */
export function trackPixelPurchase(order: { id: string; accountCode?: string; price: number; method: string }): void {
  if (typeof window === 'undefined' || !window.fbq || !order) return;
  const eventKey = `Purchase_${order.id}`;
  if (isDeduplicated(eventKey, 10000)) return;

  try {
    window.fbq('track', 'Purchase', {
      content_type: 'product',
      content_ids: [order.accountCode || order.id],
      value: order.price,
      currency: 'BDT',
      order_id: order.id,
      payment_method: order.method,
    });
  } catch {}
}
