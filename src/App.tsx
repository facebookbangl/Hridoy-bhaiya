/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Award, Search, SlidersHorizontal, Flame, 
  MessageCircle, Heart, ArrowUpRight, HelpCircle 
} from 'lucide-react';
import { Account, Review, SiteSettings, Order } from './types';
import { initialAccounts, initialReviews, initialSiteSettings } from './data/initialData';
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
import { Toast } from './components/Toast';
import { shareAccountPost } from './utils/mediaStorage';

export default function App() {
  // Local storage persisted state
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('zp_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.logoUrl || parsed.logoUrl.includes('1792782422343') || parsed.logoUrl.includes('placeholder')) {
          parsed.logoUrl = initialSiteSettings.logoUrl;
        }
        return parsed;
      } catch (e) {
        console.warn('Error reading saved settings:', e);
      }
    }
    return initialSiteSettings;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('zp_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('zp_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('zp_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Interactive States
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'level-desc'>('featured');

  const [selectedCheckoutAccount, setSelectedCheckoutAccount] = useState<Account | null>(null);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);
  const [selectedShareAccount, setSelectedShareAccount] = useState<Account | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamically load database-backed payment settings from server API
  useEffect(() => {
    fetch('/api/payment-settings')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch payment settings');
      })
      .then((data) => {
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
          paymentInstructions: data.paymentInstructions || prev.paymentInstructions
        }));
      })
      .catch((err) => {
        console.warn('Payment settings server fetch fallback to local:', err);
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

  // Filtered & Sorted accounts
  const filteredAccounts = accounts
    .filter((acc) => {
      if (filterStatus === 'available' && acc.sold) return false;
      if (filterStatus === 'sold' && !acc.sold) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = acc.code.toLowerCase().includes(q);
        const matchesTitle = acc.title.toLowerCase().includes(q);
        const matchesLevel = acc.level.toString().includes(q);
        const matchesDesc = acc.description?.toLowerCase().includes(q);
        return matchesCode || matchesTitle || matchesLevel || matchesDesc;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'level-desc') return b.level - a.level;
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
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-4 space-y-6">
        {/* Notice Bar */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-start sm:items-center gap-3 border-l-4 border-l-[#ff2a85] shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-[#ff2a85]/20 flex items-center justify-center text-[#ff2a85] shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed flex-1">
            {settings.noticeText}
          </div>
        </div>

        {/* Hero Trust Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">৫ মিনিটে ডেলিভারি</div>
              <div className="text-[10px] text-zinc-400">ইনস্ট্যান্ট আইডি এক্সেস</div>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff2a85]/10 border border-[#ff2a85]/20 text-[#ff2a85] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">১০০% ফ্রেশ একাউন্ট</div>
              <div className="text-[10px] text-zinc-400">কোনো 2-Step ঝুঁকি নেই</div>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">৩০০০+ সফল ডিল</div>
              <div className="text-[10px] text-zinc-400">বিশ্বস্ততার সাথে সম্পন্ন</div>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">সরাসরি হোয়াটসঅ্যাপ</div>
              <div className="text-[10px] text-zinc-400">২৪/৭ এডমিন সাপোর্ট</div>
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
        <section id="id-grid-section" className="scroll-mt-20 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-[#ff2a85]" />
                <span className="text-xs font-bold text-[#ff2a85] tracking-wider uppercase">
                  ফ্রি ফায়ার কালেকশন
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                উপলব্ধ ফ্রি ফায়ার আইডিসমূহ
              </h2>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Segmented Filter Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 shrink-0">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-[#ff2a85] text-white shadow-sm'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  সব ({accounts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('available')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filterStatus === 'available'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  উপলব্ধ ({accounts.filter((a) => !a.sold).length})
                </button>
                <button
                  onClick={() => setFilterStatus('sold')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filterStatus === 'sold'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-[#d8b4d8] hover:text-white'
                  }`}
                >
                  বিক্রিত ({accounts.filter((a) => a.sold).length})
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#ff2a85]"
              >
                <option value="featured">ফিচার্ড / রেকমেন্ডেড</option>
                <option value="price-asc">মূল্য: কম থেকে বেশি</option>
                <option value="price-desc">মূল্য: বেশি থেকে কম</option>
                <option value="level-desc">লেভেল: সর্বোচ্চ লেভেল</option>
              </select>

              {/* Search Box */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="আইডি বা লেভেল খুঁজুন..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#ff2a85]"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredAccounts.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-white/5 space-y-3">
              <p className="text-zinc-400 text-sm">
                দুঃখিত, আপনার অনুসন্ধানের সাথে মিলে এমন কোনো আইডি পাওয়া যায়নি।
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#ff2a85] text-white hover:bg-[#e01972] transition-colors cursor-pointer"
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

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-[#0e0713]/90 backdrop-blur-md py-10 px-4 text-center text-xs text-[#d8b4d8] space-y-4">
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
          <div className="font-extrabold text-sm text-white tracking-wider flex items-center gap-1.5">
            <span>ZERO POINT</span>
            <span className="text-[#ff2a85]">FF</span>
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
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-red-500/30 hover:border-[#FF0000] text-zinc-300 hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,0,0.35)] hover:-translate-y-0.5 cursor-pointer"
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
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-[#229ED9]/30 hover:border-[#229ED9] text-zinc-300 hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,158,217,0.35)] hover:-translate-y-0.5 cursor-pointer"
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

      {/* Floating WhatsApp Help */}
      <FloatingWhatsApp whatsappNumber={settings.whatsappNumber} />

      {/* Checkout Modal */}
      <CheckoutModal
        account={selectedCheckoutAccount}
        settings={settings}
        onClose={() => setSelectedCheckoutAccount(null)}
        onOrderSuccess={handleOrderSuccess}
        onShowToast={showToast}
      />

      {/* Account Details Lightbox Modal with Multi-Photo Slider & Video */}
      <AccountDetailModal
        account={selectedDetailAccount}
        onClose={() => setSelectedDetailAccount(null)}
        onBuy={(acc) => setSelectedCheckoutAccount(acc)}
        onShare={(acc) => handleShare(acc)}
      />

      {/* Social & Native Share Modal */}
      <ShareModal
        account={selectedShareAccount}
        onClose={() => setSelectedShareAccount(null)}
        onShowToast={showToast}
      />

      {/* Admin Panel Modal */}
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
      />
    </div>
  );
}
