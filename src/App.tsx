/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Award, Search, SlidersHorizontal, Flame, 
  MessageCircle, Heart, ArrowUpRight, HelpCircle, Gem, Filter, 
  RotateCcw, ChevronDown, ChevronUp, Check, Clock 
} from 'lucide-react';
import { Account, Review, SiteSettings, Order, TopUpPackage } from './types';
import { initialAccounts, initialReviews, initialSiteSettings } from './data/initialData';
import { initialTopUpPackages } from './data/topupPackages';
import { Header } from './components/Header';
import { PaymentQuickBar } from './components/PaymentQuickBar';
import { AccountCard } from './components/AccountCard';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountDetailModal } from './components/AccountDetailModal';
import { ShareModal } from './components/ShareModal';
import { ReviewsSection } from './components/ReviewsSection';
import { RulesSection } from './components/RulesSection';
import { FAQSection } from './components/FAQSection';
import { SocialMediaSection, YouTubeIcon, TelegramIcon, YOUTUBE_MAIN_URL, YOUTUBE_BACKUP_URL, YOUTUBE_URL, TELEGRAM_URL } from './components/SocialMediaSection';
import { AdminModal } from './components/AdminModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { FloatingDiamondTopUp } from './components/FloatingDiamondTopUp';
import { DiamondTopUpModal } from './components/DiamondTopUpModal';
import { WelcomePopupModal } from './components/WelcomePopupModal';
import { YouTubeSubscribeModal } from './components/YouTubeSubscribeModal';
import { PinnedTutorialCard } from './components/PinnedTutorialCard';
import { Toast } from './components/Toast';
import { shareAccountPost } from './utils/mediaStorage';
import { formatWhatsAppUrl, OFFICIAL_WHATSAPP_NUMBER } from './utils/whatsapp';
import { initMetaPixel, trackPixelPageView, trackPixelSearch } from './utils/metaPixel';
import { safeGetJSON, safeSetJSON, safeSessionSet } from './utils/safeStorage';

export default function App() {
  // Safe storage persisted state with bulletproof error boundaries & memory fallbacks
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = safeGetJSON<any>('zp_settings', null);
      if (saved && typeof saved === 'object') {
        // Ensure latest official brand logo is always applied
        saved.logoUrl = initialSiteSettings.logoUrl;
        const waStr = String(saved.whatsappNumber || '');
        if (!waStr || waStr.includes('1700000000') || waStr === '8801700000000') {
          saved.whatsappNumber = OFFICIAL_WHATSAPP_NUMBER;
        }
        // Ensure both Main and Backup YouTube channels are set correctly
        if (!saved.youtubeChannelUrl || saved.youtubeChannelUrl.includes('zeropoint_backup')) {
          saved.youtubeChannelUrl = initialSiteSettings.youtubeChannelUrl;
        }
        if (!saved.youtubeBackupChannelUrl || !saved.youtubeBackupChannelUrl.includes('lC2DNWd6Iy8upP61')) {
          saved.youtubeBackupChannelUrl = initialSiteSettings.youtubeBackupChannelUrl;
        }
        // Ensure latest Nagad number 01722782496 is applied
        if (!saved.nagad || saved.nagad === '01869910404') {
          saved.nagad = '01722782496';
        }
        // Ensure diamond top-up and automatic popups are turned off
        saved.diamondTopUpEnabled = false;
        saved.welcomePopupEnabled = false;
        saved.youtubePopupEnabled = false;
        const mergedSettings: SiteSettings = { 
          ...initialSiteSettings, 
          ...saved, 
          diamondTopUpEnabled: false,
          welcomePopupEnabled: false,
          youtubePopupEnabled: false
        };
        safeSetJSON('zp_settings', mergedSettings);
        return mergedSettings;
      }
    } catch (e) {
      console.warn('Error reading saved settings, using defaults:', e);
    }
    return initialSiteSettings;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = safeGetJSON<any[]>('zp_accounts', null as any);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        const validAccounts = saved.filter((acc: any) => acc && typeof acc === 'object' && acc.id && acc.code);
        
        // Ensure FF-103 price is strictly updated to 15000 ৳ and level 78
        let accountsModified = false;
        const soldCodes = new Set(['FF-102', 'FF-106', 'FF-107', 'FF-108', 'FF-109']);
        validAccounts.forEach((acc: any) => {
          if (acc.code === 'FF-103' && (acc.price !== 15000 || acc.level !== 78)) {
            acc.price = 15000;
            acc.level = 78;
            acc.title = "👑 Female Rare ID Sale 🔥 ৪টি ইভো গান MAX + ৬৪০+ ড্রেস 😱";
            acc.description = "ফিমেল রেয়ার আইডি কালেকশন! ৪টি ইভো গান ম্যাক্স, ৭৮ লেভেল এবং ৬৪০টির বেশি আনলকড বান্ডেল/ড্রেস। মাত্র ১৫০০০ টাকায় প্রিমিয়াম ভিআইপি কালেকশন আইডি।";
            accountsModified = true;
          }
          if (soldCodes.has(acc.code) && !acc.sold) {
            acc.sold = true;
            accountsModified = true;
          }
        });

        const existingIds = new Set(validAccounts.map((acc: any) => String(acc.id)));
        const existingCodes = new Set(validAccounts.map((acc: any) => String(acc.code || '')));
        const existingUrls = new Set(validAccounts.map((acc: any) => String(acc.videoUrl || '')).filter(Boolean));
        const missingInitial = initialAccounts.filter(
          (acc) => acc && !existingIds.has(String(acc.id)) && !existingCodes.has(String(acc.code)) && (!acc.videoUrl || !existingUrls.has(String(acc.videoUrl)))
        );

        let combined = missingInitial.length > 0 ? [...missingInitial, ...validAccounts] : validAccounts;

        // Low-budget accounts should be at the top
        combined.sort((a: any, b: any) => {
          if (a.sold !== b.sold) return a.sold ? 1 : -1;
          return (a.price || 0) - (b.price || 0);
        });
        accountsModified = true;

        if (missingInitial.length > 0 || accountsModified) {
          safeSetJSON('zp_accounts', combined);
        }
        return combined.length > 0 ? combined : initialAccounts;
      }
    } catch (e) {
      console.warn('Error parsing saved accounts, using defaults:', e);
    }
    return initialAccounts;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = safeGetJSON<Review[]>('zp_reviews', null as any);
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
      console.warn('Error reading saved reviews, using defaults:', e);
    }
    return initialReviews;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = safeGetJSON<Order[]>('zp_orders', null as any);
      if (saved && Array.isArray(saved)) return saved;
    } catch (e) {
      console.warn('Error reading saved orders, using defaults:', e);
    }
    return [];
  });

  const [topUpPackages, setTopUpPackages] = useState<TopUpPackage[]>(() => {
    try {
      const saved = safeGetJSON<TopUpPackage[]>('zp_topup_packages', null as any);
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
      console.warn('Error reading saved top-up packages, using defaults:', e);
    }
    return initialTopUpPackages;
  });

  // UI Interactive States & Smart Search Filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'pending' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'featured' | 'price-desc' | 'level-desc' | 'newest'>('price-asc');
  
  // Advanced Filter Drawer States
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minLevel, setMinLevel] = useState<number | ''>('');
  const [minEvo, setMinEvo] = useState<number | ''>('');
  const [minPrime, setMinPrime] = useState<number | ''>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  const [selectedCheckoutAccount, setSelectedCheckoutAccount] = useState<Account | null>(null);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);
  const [selectedShareAccount, setSelectedShareAccount] = useState<Account | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isYouTubePopupOpen, setIsYouTubePopupOpen] = useState(false);

  // Initialize Meta Pixel & Facebook Ads Retargeting if ID configured
  useEffect(() => {
    if (settings.metaPixelId) {
      initMetaPixel(settings.metaPixelId);
      trackPixelPageView();
    }
  }, [settings.metaPixelId]);


  // Dynamically load database-backed payment settings from server API (with static fallback & 3.5s timeout)
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    fetch('/api/payment-settings', { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON or static fallback host');
      })
      .then((data) => {
        if (!data || typeof data !== 'object') return;
        setSettings((prev) => ({
          ...prev,
          bkash: data.bkash || prev.bkash,
          bkashType: data.bkashType || 'Personal',
          bkashMethod: data.bkashMethod || 'Send Money',
          nagad: data.nagad || prev.nagad,
          nagadType: data.nagadType || 'Personal',
          nagadMethod: data.nagadMethod || 'Send Money',
          rocket: data.rocket || prev.rocket,
          rocketStatus: data.rocketStatus || prev.rocketStatus || 'Coming Soon',
          paymentInstructions: Array.isArray(data.paymentInstructions) ? data.paymentInstructions : prev.paymentInstructions
        }));
      })
      .catch((err) => {
        clearTimeout(timeout);
        // Expected on static deployments or slow network
        console.info('Client using static payment configuration:', err?.message || err);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Safe sync to storage with in-memory fallback
  useEffect(() => {
    safeSetJSON('zp_settings', settings);
  }, [settings]);

  useEffect(() => {
    safeSetJSON('zp_accounts', accounts);
  }, [accounts]);

  useEffect(() => {
    safeSetJSON('zp_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeSetJSON('zp_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetJSON('zp_topup_packages', topUpPackages);
  }, [topUpPackages]);

  // Load server-side top-up packages dynamically if available (with 3.5s timeout)
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    fetch('/api/topup-packages', { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON or static fallback host');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTopUpPackages(data);
        }
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.info('Client using static top-up package configuration:', err?.message || err);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Navigation & Deep Linking Handlers with Browser History Support
  const handleOpenDetailModal = (acc: Account) => {
    setSelectedDetailAccount(acc);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('id', acc.code);
        window.history.pushState({ modal: 'detail', code: acc.code }, '', url.toString());
      }
    } catch {}
  };

  const handleCloseDetailModal = () => {
    setSelectedDetailAccount(null);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('id');
        url.hash = '';
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    } catch {}
  };

  const handleOpenTopUpModal = () => {
    setIsTopUpOpen(true);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('topup', 'true');
        window.history.pushState({ modal: 'topup' }, '', url.toString());
      }
    } catch {}
  };

  const handleCloseTopUpModal = () => {
    setIsTopUpOpen(false);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('topup');
        url.searchParams.delete('membership');
        url.hash = '';
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    } catch {}
  };

  // Deep linking: Open shared account on page load, hash change, or search query (e.g. #id=FF-101, #FF-101, ?id=FF-101, /id/FF-101)
  useEffect(() => {
    const parseCodeFromUrl = (): string | null => {
      try {
        if (typeof window === 'undefined') return null;
        // 1. Path format: /id/FF-101, /account/FF-101, /post/FF-101, or /FF-101
        const pathname = window.location.pathname || '';
        const pathMatch = pathname.match(/^\/(?:id\/|account\/|post\/)?(FF-\d+)/i);
        if (pathMatch && pathMatch[1]) {
          return pathMatch[1].trim();
        }
        // 2. Query param format: ?id=FF-101, ?post=FF-101, ?code=FF-101 (survives Facebook/WhatsApp crawlers)
        const search = window.location.search || '';
        if (search) {
          const params = new URLSearchParams(search);
          const idParam = params.get('id') || params.get('post') || params.get('code') || params.get('account');
          if (idParam) return idParam.trim();
        }
        // 3. Hash format: #id=FF-101 or #FF-101
        const hash = window.location.hash || '';
        if (hash.startsWith('#id=')) {
          return hash.replace('#id=', '').trim();
        } else if (hash.startsWith('#FF-')) {
          return hash.replace('#', '').trim();
        }
      } catch (err) {
        console.warn('Error reading deep link URL params:', err);
      }
      return null;
    };

    const handleDeepLink = () => {
      const code = parseCodeFromUrl();
      if (code) {
        const normalized = code.toUpperCase();
        const found = accounts.find((a) => {
          if (!a || !a.code) return false;
          return String(a.code).trim().toUpperCase() === normalized;
        });
        if (found) {
          setSelectedDetailAccount(found);
        }
      }

      // Check Top-Up / Membership direct links
      try {
        if (typeof window !== 'undefined') {
          const search = window.location.search || '';
          const hash = window.location.hash || '';
          const path = window.location.pathname || '';
          const isTopUp = search.includes('topup') || search.includes('membership') || hash.includes('topup') || hash.includes('membership') || path.includes('/topup') || path.includes('/membership');
          if (isTopUp) {
            setIsTopUpOpen(true);
          }
          const isAdmin = search.includes('admin') || hash.includes('admin') || path.includes('/admin');
          if (isAdmin) {
            setIsAdminOpen(true);
          }
        }
      } catch (e) {
        console.warn('URL parsing error:', e);
      }
    };

    handleDeepLink();
    window.addEventListener('hashchange', handleDeepLink);
    window.addEventListener('popstate', handleDeepLink);
    return () => {
      window.removeEventListener('hashchange', handleDeepLink);
      window.removeEventListener('popstate', handleDeepLink);
    };
  }, [accounts]);

  // Dynamic SEO & Structured Data (JSON-LD) Synchronization
  useEffect(() => {
    const defaultTitle = "ZERO POINT FF - ১০০% ট্রাস্টেড ফ্রি ফায়ার আইডি শপ";
    const defaultDesc = "বাংলাদেশের ১০০% ট্রাস্টেড ফ্রি ফায়ার আইডি শপ। ইনস্ট্যান্ট bKash/Nagad পেমেন্ট, দ্রুত ডেলিভারি ও সরাসরি হোয়াটসঅ্যাপ ডিল।";
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://zeropointff.com';

    let pageTitle = defaultTitle;
    let pageDesc = defaultDesc;
    let pageImage = settings.logoUrl;
    let pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://zeropointff.com/';

    let dynamicLdJson: Record<string, unknown>;

    if (selectedDetailAccount) {
      pageTitle = `${selectedDetailAccount.code} - ${selectedDetailAccount.title} | ZERO POINT FF`;
      pageDesc = selectedDetailAccount.description || `ফ্রি ফায়ার লেভেল ${selectedDetailAccount.level} আইডি, ইভো গান: ${selectedDetailAccount.evo}টি। মূল্য: ${selectedDetailAccount.price} ৳। ১০০% ট্রাস্টেড ও ভেরিফাইড আইডি।`;
      pageImage = selectedDetailAccount.images?.[0] || selectedDetailAccount.image;
      pageUrl = `${currentOrigin}${window.location.pathname}#id=${selectedDetailAccount.code}`;

      dynamicLdJson = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${selectedDetailAccount.code} - ${selectedDetailAccount.title}`,
        "description": pageDesc,
        "sku": selectedDetailAccount.code,
        "category": "Video Game Accounts",
        "image": selectedDetailAccount.images && selectedDetailAccount.images.length > 0 
          ? selectedDetailAccount.images.map(img => {
              const str = String(img || '');
              return str.startsWith('http') ? str : `${currentOrigin}${str.startsWith('/') ? '' : '/'}${str}`;
            }) 
          : [`${currentOrigin}/${String(selectedDetailAccount.image || '').replace(/^\//, '')}`],
        "brand": {
          "@type": "Brand",
          "name": "Garena Free Fire"
        },
        "offers": {
          "@type": "Offer",
          "url": pageUrl,
          "price": selectedDetailAccount.price,
          "priceCurrency": "BDT",
          "priceValidUntil": "2028-12-31",
          "itemCondition": "https://schema.org/UsedCondition",
          "availability": selectedDetailAccount.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "ZERO POINT FF"
          }
        }
      };
    } else {
      // Catalog ItemList + Store reviews schema
      const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "5.0";

      dynamicLdJson = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ItemList",
            "name": "Free Fire ID Collection - ZERO POINT FF",
            "description": defaultDesc,
            "numberOfItems": accounts.length,
            "itemListElement": accounts.slice(0, 15).map((acc, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": `${acc.code} - ${acc.title}`,
                "sku": acc.code,
                "description": acc.description || `ফ্রি ফায়ার লেভেল ${acc.level} আইডি, ইভো গান: ${acc.evo}টি`,
                "offers": {
                  "@type": "Offer",
                  "price": acc.price,
                  "priceCurrency": "BDT",
                  "availability": acc.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
                }
              }
            }))
          },
          {
            "@type": "Store",
            "name": "ZERO POINT FF",
            "description": defaultDesc,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": avgRating,
              "reviewCount": reviews.length || 1,
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        ]
      };
    }

    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, nameOrProperty);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', pageDesc);
    updateMeta('og:title', pageTitle, true);
    updateMeta('og:description', pageDesc, true);
    updateMeta('og:url', pageUrl, true);
    if (pageImage) {
      updateMeta('og:image', pageImage, true);
      updateMeta('twitter:image', pageImage);
    }
    updateMeta('twitter:title', pageTitle);
    updateMeta('twitter:description', pageDesc);

    // Update dynamic JSON-LD in head
    let scriptTag = document.getElementById('zp-dynamic-ldjson') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'zp-dynamic-ldjson';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(dynamicLdJson);
  }, [selectedDetailAccount, accounts, reviews, settings.logoUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'store-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseWelcomePopup = () => {
    safeSessionSet('zp_welcome_popup_seen', 'true');
    setIsWelcomePopupOpen(false);
  };

  const handleClaimWelcomeOffer = () => {
    handleCloseWelcomePopup();
    const discount = settings.welcomePopupDiscount || '১৫% ডিসকাউন্ট';
    const defaultMsg = `আসসালামু আলাইকুম ZERO POINT FF, আমি প্রবাসী/মাদ্রাসা ভাই-বোনদের জন্য ${discount} সম্মানজনক অফারটি গ্রহণ করতে চাই।`;
    const targetUrl = settings.welcomePopupTargetUrl?.trim() || formatWhatsAppUrl(settings.whatsappNumber, defaultMsg);

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    scrollToSection('id-grid-section');
    showToast('অফারটি অ্যাক্টিভেট হয়েছে! আপনার পছন্দের আইডি বেছে নিন।');
  };

  // SHARE HANDLER: Uses Android Web Share API or falls back to Share Modal
  const handleShare = async (account: Account) => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${currentOrigin}/?id=${encodeURIComponent(account.code)}`;

    const payload = {
      title: `ZERO POINT FF - ${account.code} (${account.price}৳)`,
      text: `🔥 ফ্রি ফায়ার আইডি ডিল! লেভেল: ${account.level}, ইভো গান: ${account.evo}টি। মূল্য: ${account.price} ৳`,
      url: shareUrl,
    };

    // If Web Share is supported, try native mobile dialog
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        const result = await shareAccountPost(payload);
        if (result.shared) {
          showToast('শেয়ার সম্পন্ন হয়েছে!');
          return;
        }
      } catch {
        // Fallback to modal
      }
    }

    // Otherwise show rich social share modal
    setSelectedShareAccount(account);
  };

  // Helper to extract Prime level cleanly
  const getAccountPrimeLevel = (acc: Account): number => {
    if (typeof acc.primeLevel === 'number') return acc.primeLevel;
    const text = `${acc.title} ${acc.description || ''}`;
    const match = text.match(/Prime\s*([0-9]+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Filtered & Sorted accounts (guarded against missing fields)
  const filteredAccounts = accounts
    .filter((acc) => {
      if (!acc || typeof acc !== 'object') return false;
      const isSold = Boolean(acc.sold || acc.status === 'sold');
      const isPending = acc.status === 'pending';
      const isAvailable = !isSold && !isPending;

      if (filterStatus === 'available' && !isAvailable) return false;
      if (filterStatus === 'pending' && !isPending) return false;
      if (filterStatus === 'sold' && !isSold) return false;

      // Price range filters
      if (minPrice !== '' && (acc.price || 0) < Number(minPrice)) return false;
      if (maxPrice !== '' && (acc.price || 0) > Number(maxPrice)) return false;

      // Level filter
      if (minLevel !== '' && (acc.level || 0) < Number(minLevel)) return false;

      // Evo gun count filter
      if (minEvo !== '' && (acc.evo || 0) < Number(minEvo)) return false;

      // Prime level filter
      if (minPrime !== '' && getAccountPrimeLevel(acc) < Number(minPrime)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = (acc.code || '').toLowerCase().includes(q);
        const matchesTitle = (acc.title || '').toLowerCase().includes(q);
        const matchesLevel = (acc.level || 0).toString().includes(q);
        const matchesDesc = (acc.description || '').toLowerCase().includes(q);
        const primeLvl = getAccountPrimeLevel(acc);
        const matchesPrime = primeLvl > 0 && `prime ${primeLvl}`.includes(q);
        return matchesCode || matchesTitle || matchesLevel || matchesDesc || matchesPrime;
      }
      return true;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      const aSold = Boolean(a.sold || a.status === 'sold');
      const bSold = Boolean(b.sold || b.status === 'sold');
      // Available accounts first, pending next, sold accounts at bottom
      if (aSold !== bSold) return aSold ? 1 : -1;
      const aPending = a.status === 'pending';
      const bPending = b.status === 'pending';
      if (aPending !== bPending) return aPending ? 1 : -1;

      if (sortBy === 'newest') {
        const numA = parseInt((a.code || '').replace(/\D/g, '') || '0', 10);
        const numB = parseInt((b.code || '').replace(/\D/g, '') || '0', 10);
        return numB - numA;
      }
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'level-desc') return (b.level || 0) - (a.level || 0);
      // Low-budget first (default & price-asc)
      return (a.price || 0) - (b.price || 0);
    });

  const activeFiltersCount = 
    (minPrice !== '' ? 1 : 0) + 
    (maxPrice !== '' ? 1 : 0) + 
    (minLevel !== '' ? 1 : 0) + 
    (minEvo !== '' ? 1 : 0) + 
    (minPrime !== '' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinLevel('');
    setMinEvo('');
    setMinPrime('');
    setFilterStatus('all');
    setSearchQuery('');
    setSortBy('price-asc');
    showToast('সব ফিল্টার রিসেট করা হয়েছে!');
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 3) {
      trackPixelSearch(val.trim());
    }
  };

  // Handlers for Admin actions
  const handleAddAccount = (newAcc: Account) => {
    setAccounts([newAcc, ...accounts]);
  };

  const handleToggleSold = (id: string) => {
    setAccounts(
      accounts.map((acc) => (acc.id === id ? { ...acc, sold: !acc.sold } : acc))
    );
    showToast('আইডির স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে!');
  };

  const handleUpdateAccountStatus = (id: string, newStatus: 'available' | 'pending' | 'sold') => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== id) return acc;
        return {
          ...acc,
          status: newStatus,
          sold: newStatus === 'sold'
        };
      })
    );
    showToast(`আইডির স্ট্যাটাস '${newStatus === 'sold' ? 'Sold' : newStatus === 'pending' ? 'Pending' : 'Available'}' হিসেবে আপডেট করা হয়েছে!`);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
    showToast('আইডি পোস্ট মুছে ফেলা হয়েছে!');
  };

  const handleAddReview = (newRevData: Omit<Review, 'id' | 'approved'>) => {
    const newRev: Review = {
      ...newRevData,
      id: `rev_${Date.now()}`,
      approved: false // Held for admin approval
    };
    setReviews([newRev, ...reviews]);
  };

  const handleApproveReview = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, approved: true } : r))
    );
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#ff2a85] selection:text-white pb-16 sm:pb-8">
      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* Header */}
      <Header
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateTo={scrollToSection}
        onOpenWelcomePopup={() => setIsWelcomePopupOpen(true)}
        onOpenTopUp={handleOpenTopUpModal}
        onOpenYouTubePopup={() => setIsYouTubePopupOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-4 space-y-6">
        {/* Notice Bar */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-start sm:items-center gap-3 border-l-4 border-l-[#ff2a85] shadow-lg">
          <div className="w-8 h-8 rounded-xl glass-badge-pink flex items-center justify-center text-[#ff2a85] shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed flex-1">
            {settings.noticeText.replace(/^[📌\s]*নির্দেশনা:\s*/, '')}
          </div>
        </div>

        {/* Hero Trust Highlights Strip (Frosted Glass Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all">
            <div className="w-8 h-8 rounded-xl glass-badge-emerald text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">৫ মিনিটে ডেলিভারি</div>
              <div className="text-[11px] text-[#d8b4d8]">ইনস্ট্যান্ট আইডি এক্সেস</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-pink-500/40 hover:bg-white/[0.06] transition-all">
            <div className="w-8 h-8 rounded-xl glass-badge-pink text-[#ff2a85] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">১০০% ফ্রেশ একাউন্ট</div>
              <div className="text-[11px] text-[#d8b4d8]">নিরাপদ ও পরীক্ষিত</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-purple-500/40 hover:bg-white/[0.06] transition-all">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/35 text-purple-300 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">৩০০০+ সফল ডিল</div>
              <div className="text-[11px] text-[#d8b4d8]">বিশ্বস্ততার সাথে সম্পন্ন</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-amber-500/40 hover:bg-white/[0.06] transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">সরাসরি হোয়াটসঅ্যাপ</div>
              <div className="text-[11px] text-[#d8b4d8]">২৪/৭ এডমিন সাপোর্ট</div>
            </div>
          </div>
        </div>

        {/* 1-Tap Copy Payment Quick Bar */}
        <PaymentQuickBar 
          settings={settings} 
          onShowToast={showToast} 
          onNavigateToIds={() => scrollToSection('id-grid-section')}
        />

        {/* ================= PINNED BUY & SELL VIDEO TUTORIAL ================= */}
        <section id="tutorial-video-section" className="scroll-mt-20">
          <PinnedTutorialCard
            whatsappNumber={settings.whatsappNumber}
            onNavigateToIds={() => scrollToSection('id-grid-section')}
          />
        </section>

        {/* ================= ID GRID & FILTER BAR ================= */}
        <section id="id-grid-section" className="scroll-mt-20 pt-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#ff2a85]">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wide">
                  ফ্রি ফায়ার কালেকশন
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                উপলব্ধ ফ্রি ফায়ার আইডিসমূহ
              </h2>
            </div>

            {/* Filter Tabs & Search Bar with Frosted Glass Look */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Segmented Filter Buttons in Glass Container */}
              <div className="flex items-center p-1 rounded-2xl glass-input shrink-0 h-10 overflow-x-auto max-w-full">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === 'all'
                      ? 'bg-gradient-to-r from-[#ff2a85] to-[#ff1a53] text-white shadow-[0_2px_10px_rgba(255,42,133,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  সব ({accounts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('available')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === 'available'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  উপলব্ধ ({accounts.filter((a) => !a.sold && a.status !== 'sold' && a.status !== 'pending').length})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === 'pending'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-[0_2px_10px_rgba(217,119,6,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  পেন্ডিং ({accounts.filter((a) => a.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilterStatus('sold')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === 'sold'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_2px_10px_rgba(239,68,68,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  বিক্রিত ({(1264 + accounts.filter((a) => a.sold || a.status === 'sold').length).toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])})
                </button>
              </div>

              {/* Sort Selector in Glass */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3.5 rounded-2xl glass-input text-white text-xs font-medium focus:outline-none focus:border-[#ff2a85] cursor-pointer"
              >
                <option value="price-asc" className="bg-[#150a1e] text-white">লো বাজেট প্রথমে (কম থেকে বেশি)</option>
                <option value="newest" className="bg-[#150a1e] text-white">নতুন তালিকাভুক্ত (Newest)</option>
                <option value="featured" className="bg-[#150a1e] text-white">ফিচার্ড কালেকশন</option>
                <option value="price-desc" className="bg-[#150a1e] text-white">হাই বাজেট (বেশি থেকে কম)</option>
                <option value="level-desc" className="bg-[#150a1e] text-white">সর্বোচ্চ লেভেল</option>
              </select>

              {/* Search Box in Glass */}
              <div className="relative flex-1 sm:w-48 h-10">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="আইডি বা লেভেল খুঁজুন..."
                  className="w-full pl-8 pr-3 py-2 rounded-2xl glass-input text-white placeholder-zinc-400 text-xs focus:outline-none focus:border-[#ff2a85]"
                />
              </div>

              {/* Filter Drawer Toggle Button */}
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className={`h-10 px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isFilterExpanded || activeFiltersCount > 0
                    ? 'bg-[#ff2a85] text-white border-[#ff2a85] shadow-[0_2px_12px_rgba(255,42,133,0.35)]'
                    : 'glass-input text-[#d8b4d8] hover:text-white border-white/10'
                }`}
                title="ফিল্টার অপশন খুলুন"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>ফিল্টার</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-black font-extrabold text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                {isFilterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {isFilterExpanded && (
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#ff2a85]/30 mb-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#ff2a85]" />
                  <h4 className="text-sm font-bold text-white">স্মার্ট ফিল্টারিং ও সার্চ</h4>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-[#ff2a85] hover:text-pink-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>সব রিসেট করুন</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Price Range */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 block">বাজেট পরিসীমা (টাকা):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="সর্বনিম্ন"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                    />
                    <span className="text-zinc-500 text-xs">-</span>
                    <input
                      type="number"
                      placeholder="সর্বোচ্চ"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                    />
                  </div>
                  {/* Quick price chips */}
                  <div className="flex items-center gap-1 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => { setMinPrice(''); setMaxPrice(3000); }}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 cursor-pointer"
                    >
                      &lt; ৩,০০০৳
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMinPrice(3000); setMaxPrice(7000); }}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 cursor-pointer"
                    >
                      ৩,০০০-৭,০০০৳
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMinPrice(7000); setMaxPrice(''); }}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 cursor-pointer"
                    >
                      ৭,০০০৳+
                    </button>
                  </div>
                </div>

                {/* 2. Min Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 block">আইডি লেভেল:</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'সব', val: '' },
                      { label: '৭০+', val: 70 },
                      { label: '৭৫+', val: 75 },
                      { label: '৮০+', val: 80 }
                    ].map((lvl) => (
                      <button
                        key={lvl.label}
                        type="button"
                        onClick={() => setMinLevel(lvl.val as any)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          minLevel === lvl.val
                            ? 'bg-[#ff2a85] text-white shadow-sm'
                            : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Min Evo Guns */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 block">ইভো গান (Evo Guns):</label>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { label: 'সব', val: '' },
                      { label: '২+', val: 2 },
                      { label: '৩+', val: 3 },
                      { label: '৪+', val: 4 },
                      { label: '৫+', val: 5 }
                    ].map((evo) => (
                      <button
                        key={evo.label}
                        type="button"
                        onClick={() => setMinEvo(evo.val as any)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          minEvo === evo.val
                            ? 'bg-[#ff2a85] text-white shadow-sm'
                            : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {evo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Min Prime Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 block">প্রাইম লেভেল (Prime):</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'সব', val: '' },
                      { label: 'Prime 4+', val: 4 },
                      { label: 'Prime 6+', val: 6 },
                      { label: 'Prime 7+', val: 7 }
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setMinPrime(p.val as any)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          minPrime === p.val
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {filteredAccounts.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl border border-white/10 space-y-3">
              <p className="text-zinc-200 text-sm font-medium">
                {filterStatus === 'sold'
                  ? 'আলহামদুলিল্লাহ! ইতিমধ্যে আমাদের ১২৬৪+ ফ্রি ফায়ার আইডি সফলভাবে বিক্রি সম্পন্ন হয়েছে।'
                  : 'দুঃখিত, আপনার অনুসন্ধানের সাথে মিলে এমন কোনো আইডি পাওয়া যায়নি।'}
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#ff2a85] to-[#ff1a53] text-white hover:opacity-90 transition-all cursor-pointer shadow-md flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব ফিল্টার রিসেট করুন ({accounts.length}টি আইডি দেখুন)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-clip">
              {filteredAccounts.map((account, index) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  index={index}
                  onBuy={(acc) => setSelectedCheckoutAccount(acc)}
                  onViewDetails={handleOpenDetailModal}
                  onShare={(acc) => handleShare(acc)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4-Step Rules Section */}
        <RulesSection />

        {/* Authentic Customer Trust & FAQ Section */}
        <FAQSection />

        {/* 30 Authentic Customer Reviews Section */}
        <ReviewsSection
          reviews={reviews}
          onSubmitReview={handleAddReview}
          onShowToast={showToast}
        />

        {/* Our Social Media Section with Both YouTube Channels */}
        <SocialMediaSection 
          mainChannelUrl={settings.youtubeChannelUrl || YOUTUBE_MAIN_URL}
          backupChannelUrl={settings.youtubeBackupChannelUrl || YOUTUBE_BACKUP_URL}
          telegramUrl={TELEGRAM_URL}
        />
      </main>

      {/* Footer in Frosted Glass */}
      <footer className="mt-16 border-t border-white/10 bg-[#0c0612]/65 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] py-10 px-4 text-center text-xs text-[#d8b4d8] space-y-4">
        <div className="flex items-center justify-center gap-2.5">
          <img
            src={settings.logoUrl || '/zero_point_logo.png'}
            alt="ZERO POINT FF"
            width="28"
            height="28"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/zero_point_logo.png';
            }}
            className="w-7 h-7 rounded-full object-cover border border-red-500/50 shadow-[0_0_10px_rgba(255,30,60,0.5)]"
          />
          <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
            <span className="tracking-wider">ZERO POINT</span>
            <span className="text-[#ff2a85] tracking-wider">FF</span>
            <span className="text-[#d8b4d8] font-normal text-xs">· বাংলাদেশের বিশ্বস্ত ফ্রি ফায়ার আইডি শপ</span>
          </div>
        </div>

        {/* Social Media Links in Footer - Both Channels & Telegram */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 pb-1">
          <a
            href={settings.youtubeChannelUrl || YOUTUBE_MAIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ZERO POINT FF মেইন YouTube চ্যানেল"
            className="glass-button group flex items-center gap-2 px-3.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:border-red-500/50 cursor-pointer"
          >
            <div className="text-[#FF0000] group-hover:scale-110 transition-transform">
              <YouTubeIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">মেইন চ্যানেল</span>
          </a>

          <a
            href={settings.youtubeBackupChannelUrl || YOUTUBE_BACKUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ZERO POINT FF ব্যাকআপ YouTube চ্যানেল"
            className="glass-button group flex items-center gap-2 px-3.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:border-orange-500/50 cursor-pointer"
          >
            <div className="text-orange-400 group-hover:scale-110 transition-transform">
              <YouTubeIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">ব্যাকআপ চ্যানেল</span>
          </a>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ZERO POINT FF Telegram চ্যানেল"
            className="glass-button group flex items-center gap-2 px-3.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:border-[#229ED9]/50 cursor-pointer"
          >
            <div className="text-[#229ED9] group-hover:scale-110 transition-transform">
              <TelegramIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Telegram</span>
          </a>
        </div>

        <p className="max-w-xl mx-auto text-zinc-400 text-[11px] leading-relaxed">
          সকল ফ্রি ফায়ার একাউন্ট নিরাপদ ও ম্যানুয়ালি ভেরিফায়েড। পেমেন্ট সম্পন্ন করার সাথে সাথে অফিসিয়াল হোয়াটসঅ্যাপে যোগাযোগের মাধ্যমে ফুল এক্সেস নিশ্চিত করা হয়।
        </p>

        <div className="text-[10px] text-zinc-500 pt-2 border-t border-white/5 max-w-sm mx-auto">
          © {new Date().getFullYear()} ZERO POINT FF. All Rights Reserved.
        </div>
      </footer>

      {/* Floating Diamond Top-Up Widget (Non-blocking, above WhatsApp button) - Temporarily Off */}
      {settings.diamondTopUpEnabled && (
        <FloatingDiamondTopUp onOpenTopUp={handleOpenTopUpModal} />
      )}

      {/* Floating WhatsApp Help */}
      <FloatingWhatsApp whatsappNumber={settings.whatsappNumber} />

      {/* Islamic Automatic Welcome Popup Modal */}
      <WelcomePopupModal
        isOpen={isWelcomePopupOpen}
        onClose={handleCloseWelcomePopup}
        onClaimOffer={handleClaimWelcomeOffer}
        settings={settings}
      />

      {/* YouTube Subscribe 100 TK Discount Popup Modal */}
      <YouTubeSubscribeModal
        isOpen={isYouTubePopupOpen}
        onClose={() => setIsYouTubePopupOpen(false)}
        settings={settings}
        onApplyDiscount={(code) => {
          showToast(`'${code}' কুপন কোড আপনার অর্ডারের জন্য সক্রিয় করা হয়েছে!`);
        }}
        onNavigateToIds={() => scrollToSection('id-grid-section')}
        onShowToast={showToast}
      />

      {/* Free Fire Diamond Top-Up / Membership Modal (Accessible via Header, Float, or Direct URL) */}
      {(isTopUpOpen || settings.diamondTopUpEnabled) && (
        <DiamondTopUpModal
          isOpen={isTopUpOpen}
          onClose={handleCloseTopUpModal}
          settings={settings}
          packages={topUpPackages}
          onOrderSuccess={handleOrderSuccess}
          onShowToast={showToast}
        />
      )}

      {/* Checkout Modal */}
      {selectedCheckoutAccount && (
        <CheckoutModal
          account={selectedCheckoutAccount}
          settings={settings}
          onClose={() => setSelectedCheckoutAccount(null)}
          onOrderSuccess={handleOrderSuccess}
          onShowToast={showToast}
        />
      )}

      {/* Account Details Lightbox Modal with Multi-Photo Slider & Video */}
      {selectedDetailAccount && (
        <AccountDetailModal
          account={selectedDetailAccount}
          whatsappNumber={settings.whatsappNumber}
          onClose={handleCloseDetailModal}
          onBuy={(acc) => setSelectedCheckoutAccount(acc)}
          onShare={(acc) => handleShare(acc)}
        />
      )}

      {/* Social & Native Share Modal */}
      {selectedShareAccount && (
        <ShareModal
          account={selectedShareAccount}
          onClose={() => setSelectedShareAccount(null)}
          onShowToast={showToast}
        />
      )}

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          accounts={accounts}
          onAddAccount={handleAddAccount}
          onToggleSold={handleToggleSold}
          onDeleteAccount={handleDeleteAccount}
          reviews={reviews}
          onApproveReview={handleApproveReview}
          onDeleteReview={handleDeleteReview}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onShowToast={showToast}
          onPreviewWelcomePopup={() => setIsWelcomePopupOpen(true)}
          onPreviewYouTubePopup={() => setIsYouTubePopupOpen(true)}
          topUpPackages={topUpPackages}
          onUpdateTopUpPackages={setTopUpPackages}
          onUpdateAccountStatus={handleUpdateAccountStatus}
        />
      )}
    </div>
  );
}
