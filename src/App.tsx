/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Award, Search, SlidersHorizontal, Flame, 
  MessageCircle, Heart, ArrowUpRight, HelpCircle, Gem 
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
import { SocialMediaSection, YouTubeIcon, TelegramIcon, YOUTUBE_URL, TELEGRAM_URL } from './components/SocialMediaSection';
import { AdminModal } from './components/AdminModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { FloatingDiamondTopUp } from './components/FloatingDiamondTopUp';
import { DiamondTopUpModal } from './components/DiamondTopUpModal';
import { WelcomePopupModal } from './components/WelcomePopupModal';
import { YouTubeSubscribeModal } from './components/YouTubeSubscribeModal';
import { Toast } from './components/Toast';
import { shareAccountPost } from './utils/mediaStorage';
import { formatWhatsAppUrl, OFFICIAL_WHATSAPP_NUMBER } from './utils/whatsapp';

export default function App() {
  // Local storage persisted state with bulletproof error boundaries
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return initialSiteSettings;
      const saved = window.localStorage.getItem('zp_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const logoStr = String(parsed.logoUrl || '');
          if (!logoStr || logoStr.includes('1792782422343') || logoStr.includes('placeholder')) {
            parsed.logoUrl = initialSiteSettings.logoUrl;
          }
          const waStr = String(parsed.whatsappNumber || '');
          if (!waStr || waStr.includes('1700000000') || waStr === '8801700000000') {
            parsed.whatsappNumber = OFFICIAL_WHATSAPP_NUMBER;
          }
          return { ...initialSiteSettings, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Error reading saved settings, using defaults:', e);
    }
    return initialSiteSettings;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return initialAccounts;
      const saved = window.localStorage.getItem('zp_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validAccounts = parsed.filter((acc: any) => acc && typeof acc === 'object' && acc.id && acc.code);
          const existingIds = new Set(validAccounts.map((acc: any) => String(acc.id)));
          const existingUrls = new Set(validAccounts.map((acc: any) => String(acc.videoUrl || '')).filter(Boolean));
          const missingInitial = initialAccounts.filter(
            (acc) => acc && !existingIds.has(String(acc.id)) && (!acc.videoUrl || !existingUrls.has(String(acc.videoUrl)))
          );
          if (missingInitial.length > 0) {
            const merged = [...validAccounts, ...missingInitial];
            try {
              window.localStorage.setItem('zp_accounts', JSON.stringify(merged));
            } catch {}
            return merged;
          }
          return validAccounts.length > 0 ? validAccounts : initialAccounts;
        }
      }
    } catch (e) {
      console.warn('Error parsing saved accounts, using defaults:', e);
    }
    return initialAccounts;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return initialReviews;
      const saved = window.localStorage.getItem('zp_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved reviews, using defaults:', e);
    }
    return initialReviews;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const saved = window.localStorage.getItem('zp_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved orders, using defaults:', e);
    }
    return [];
  });

  const [topUpPackages, setTopUpPackages] = useState<TopUpPackage[]>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return initialTopUpPackages;
      const saved = window.localStorage.getItem('zp_topup_packages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved top-up packages, using defaults:', e);
    }
    return initialTopUpPackages;
  });

  // UI Interactive States
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'level-desc'>('featured');

  const [selectedCheckoutAccount, setSelectedCheckoutAccount] = useState<Account | null>(null);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);
  const [selectedShareAccount, setSelectedShareAccount] = useState<Account | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isYouTubePopupOpen, setIsYouTubePopupOpen] = useState(false);

  // Automatic YouTube Subscribe ৳100 Discount Popup trigger (1.8s after entry)
  useEffect(() => {
    if (settings.youtubePopupEnabled === false) return;

    // Session control: Do not bother repeatedly on the same visit if already seen or closed
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const seen = window.sessionStorage.getItem('zp_yt_discount_seen');
        if (seen === 'true') return;
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setIsYouTubePopupOpen(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [settings.youtubePopupEnabled]);

  // Automatic Welcome Popup trigger (only if YouTube popup is not active/priority)
  useEffect(() => {
    if (settings.welcomePopupEnabled === false) return;
    if (settings.youtubePopupEnabled) return; // Prioritize YouTube discount popup

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const seen = window.sessionStorage.getItem('zp_welcome_popup_seen');
        if (seen === 'true') return;
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setIsWelcomePopupOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [settings.welcomePopupEnabled, settings.youtubePopupEnabled]);

  // Dynamically load database-backed payment settings from server API (with static Netlify fallback)
  useEffect(() => {
    fetch('/api/payment-settings')
      .then((res) => {
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
        // Expected when running on static deployments (e.g. Netlify)
        console.info('Client using static payment configuration:', err?.message || err);
      });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zp_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync warning', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('zp_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Accounts storage warning', e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem('zp_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.warn('Reviews storage warning', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('zp_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Orders storage warning', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('zp_topup_packages', JSON.stringify(topUpPackages));
    } catch (e) {
      console.warn('TopUp packages storage warning', e);
    }
  }, [topUpPackages]);

  // Load server-side top-up packages dynamically if available
  useEffect(() => {
    fetch('/api/topup-packages')
      .then((res) => {
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
        console.info('Client using static top-up package configuration:', err?.message || err);
      });
  }, []);

  // Deep linking: Open shared account on page load or hash change (e.g. #id=FF-101)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#id=')) {
        const code = hash.replace('#id=', '').trim().toUpperCase();
        const found = accounts.find((a) => a.code.toUpperCase() === code);
        if (found) {
          setSelectedDetailAccount(found);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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
          ? selectedDetailAccount.images.map(img => img.startsWith('http') ? img : `${currentOrigin}${img.startsWith('/') ? '' : '/'}${img}`) 
          : [`${currentOrigin}/${selectedDetailAccount.image}`],
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
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('zp_welcome_popup_seen', 'true');
      }
    } catch {}
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
    const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const shareUrl = `${currentUrl}#id=${account.code}`;

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

  // Filtered & Sorted accounts (guarded against missing fields)
  const filteredAccounts = accounts
    .filter((acc) => {
      if (!acc || typeof acc !== 'object') return false;
      if (filterStatus === 'available' && acc.sold) return false;
      if (filterStatus === 'sold' && !acc.sold) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = (acc.code || '').toLowerCase().includes(q);
        const matchesTitle = (acc.title || '').toLowerCase().includes(q);
        const matchesLevel = (acc.level || 0).toString().includes(q);
        const matchesDesc = (acc.description || '').toLowerCase().includes(q);
        return matchesCode || matchesTitle || matchesLevel || matchesDesc;
      }
      return true;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'level-desc') return (b.level || 0) - (a.level || 0);
      // Default: available first, then featured, then newest
      if (a.sold !== b.sold) return a.sold ? 1 : -1;
      return 0;
    });

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
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenYouTubePopup={() => setIsYouTubePopupOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-4 space-y-6">
        {/* Sell Free Fire Account Action Banner (Frosted Glass with Neon Rim) */}
        <div className="pt-1">
          <a
            href={formatWhatsAppUrl(
              settings.whatsappNumber,
              'আসসালামু আলাইকুম ZERO POINT FF, আমি আমার একটি ফ্রি ফায়ার একাউন্ট বিক্রি করতে চাই। একাউন্টের বিস্তারিত তথ্য ও দাম নিচে শেয়ার করছি...'
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="আপনার ফ্রি ফায়ার একাউন্ট বিক্রি করুন"
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#200932]/75 via-[#2d0d44]/70 to-[#140827]/75 backdrop-blur-xl border-2 border-[#ff2a85]/50 hover:border-[#ff2a85] p-3.5 sm:p-4.5 flex items-center justify-between gap-3 sm:gap-4 shadow-[0_8px_32px_rgba(255,42,133,0.3),inset_0_1px_1px_rgba(255,255,255,0.22)] hover:shadow-[0_12px_42px_rgba(255,42,133,0.55)] transition-all duration-300 active:scale-[0.99] cursor-pointer"
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-[#ff2a85]/20 rounded-full blur-2xl pointer-events-none group-hover:bg-[#ff2a85]/35 transition-all"></div>
            <div className="absolute bottom-0 left-12 -mb-8 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center gap-3 sm:gap-3.5">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#ff2a85] via-rose-500 to-purple-600 p-0.5 shadow-[0_0_18px_rgba(255,42,133,0.65)] shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#12071f]/85 backdrop-blur-md rounded-[14px] flex items-center justify-center">
                  <span className="text-xl sm:text-2xl animate-pulse">🔥</span>
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff2a85] opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ff2a85] border border-black"></span>
                </span>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm sm:text-base font-black text-white group-hover:text-[#ff70b2] transition-colors tracking-wide">
                    আপনার ফ্রি ফায়ার একাউন্ট বিক্রি করুন
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full glass-badge-emerald text-emerald-300">
                    তাৎক্ষণিক ক্যাশ
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#d8b4d8] leading-tight">
                  সর্বোচ্চ রেটে আইডি বিক্রি করতে এখানে ক্লিক করে সরাসরি হোয়াটসঅ্যাপে কথা বলুন
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-black shadow-[0_0_18px_rgba(16,185,129,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] shrink-0 group-hover:scale-105 transition-all">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-white p-0.5 shrink-0 flex items-center justify-center shadow-sm">
                <img
                  src="/assets/aistudio/images_1d3fa6a5.png"
                  alt="WhatsApp"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="whitespace-nowrap hidden xs:inline">বিক্রি করতে ক্লিক করুন</span>
              <span className="whitespace-nowrap xs:hidden">বিক্রি করুন</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>

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
              <div className="flex items-center p-1 rounded-2xl glass-input shrink-0 h-10">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-gradient-to-r from-[#ff2a85] to-[#ff1a53] text-white shadow-[0_2px_10px_rgba(255,42,133,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  সব ({accounts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('available')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'available'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  উপলব্ধ ({accounts.filter((a) => !a.sold).length})
                </button>
                <button
                  onClick={() => setFilterStatus('sold')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'sold'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_2px_10px_rgba(239,68,68,0.4)]'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  বিক্রিত ({accounts.filter((a) => a.sold).length})
                </button>
              </div>

              {/* Sort Selector in Glass */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3.5 rounded-2xl glass-input text-white text-xs font-medium focus:outline-none focus:border-[#ff2a85] cursor-pointer"
              >
                <option value="featured" className="bg-[#150a1e] text-white">ফিচার্ড কালেকশন</option>
                <option value="price-asc" className="bg-[#150a1e] text-white">মূল্য (কম থেকে বেশি)</option>
                <option value="price-desc" className="bg-[#150a1e] text-white">মূল্য (বেশি থেকে কম)</option>
                <option value="level-desc" className="bg-[#150a1e] text-white">সর্বোচ্চ লেভেল</option>
              </select>

              {/* Search Box in Glass */}
              <div className="relative flex-1 sm:w-48 h-10">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="আইডি বা লেভেল খুঁজুন..."
                  className="w-full pl-8 pr-3 py-2 rounded-2xl glass-input text-white placeholder-zinc-400 text-xs focus:outline-none focus:border-[#ff2a85]"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredAccounts.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl border border-white/10 space-y-3">
              <p className="text-zinc-300 text-sm">
                দুঃখিত, আপনার অনুসন্ধানের সাথে মিলে এমন কোনো আইডি পাওয়া যায়নি।
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#ff2a85] text-white hover:bg-[#e01972] transition-colors cursor-pointer shadow-md"
              >
                সব আইডি রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onBuy={(acc) => setSelectedCheckoutAccount(acc)}
                  onViewDetails={(acc) => setSelectedDetailAccount(acc)}
                  onShare={(acc) => handleShare(acc)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4-Step Rules Section */}
        <RulesSection />

        {/* 30 Authentic Customer Reviews Section */}
        <ReviewsSection
          reviews={reviews}
          onSubmitReview={handleAddReview}
          onShowToast={showToast}
        />

        {/* Our Social Media Section */}
        <SocialMediaSection />
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

        {/* Social Media Links in Footer */}
        <div className="flex items-center justify-center gap-3 pt-1 pb-1">
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ZERO POINT FF YouTube চ্যানেল"
            className="glass-button group flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:border-red-500/50 cursor-pointer"
          >
            <div className="text-[#FF0000] group-hover:scale-110 transition-transform">
              <YouTubeIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">YouTube</span>
          </a>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ZERO POINT FF Telegram চ্যানেল"
            className="glass-button group flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:border-[#229ED9]/50 cursor-pointer"
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

      {/* Floating Diamond Top-Up Widget (Non-blocking, above WhatsApp button) */}
      <FloatingDiamondTopUp onOpenTopUp={() => setIsTopUpOpen(true)} />

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

      {/* Free Fire Diamond Top-Up Modal */}
      <DiamondTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        settings={settings}
        packages={topUpPackages}
        onOrderSuccess={handleOrderSuccess}
        onShowToast={showToast}
      />

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
          onClose={() => setSelectedDetailAccount(null)}
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
        />
      )}
    </div>
  );
}
