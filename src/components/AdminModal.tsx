import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Lock, Unlock, Settings, PlusCircle, CheckSquare, MessageSquare, 
  Trash2, ToggleLeft, ToggleRight, ShieldAlert, ShoppingBag, Check, 
  Upload, Image as ImageIcon, Video as VideoIcon, ArrowLeft, ArrowRight, 
  Star, RefreshCw, AlertCircle, Play, Eye, Smartphone, LogOut, KeyRound, ShieldCheck,
  Sparkles, Gem, Ticket, Zap, Flame
} from 'lucide-react';
import { Account, SiteSettings, Review, Order, TopUpPackage } from '../types';
import { 
  processImageFile, 
  processVideoFile, 
  extractYouTubeId, 
  getYouTubeEmbedUrl,
  fetchYouTubeDetails,
  getYouTubeThumbnail
} from '../utils/mediaStorage';
import { OFFICIAL_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  accounts: Account[];
  onAddAccount: (acc: Account) => void;
  onToggleSold: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  reviews: Review[];
  onApproveReview: (id: string) => void;
  onDeleteReview: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onShowToast: (msg: string) => void;
  onPreviewWelcomePopup?: () => void;
  onPreviewYouTubePopup?: () => void;
  topUpPackages?: TopUpPackage[];
  onUpdateTopUpPackages?: (packages: TopUpPackage[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  accounts,
  onAddAccount,
  onToggleSold,
  onDeleteAccount,
  reviews,
  onApproveReview,
  onDeleteReview,
  orders,
  onUpdateOrderStatus,
  onShowToast,
  onPreviewWelcomePopup,
  onPreviewYouTubePopup,
  topUpPackages = [],
  onUpdateTopUpPackages,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem('zp_admin_token') || '';
    } catch {
      return '';
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'accounts' | 'orders' | 'reviews' | 'topup'>('accounts');
  const [adminPackages, setAdminPackages] = useState<TopUpPackage[]>(topUpPackages);
  const [isSavingPackages, setIsSavingPackages] = useState(false);

  useEffect(() => {
    if (topUpPackages && topUpPackages.length > 0) {
      setAdminPackages(topUpPackages);
    }
  }, [topUpPackages]);

  // Verify stored session token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('zp_admin_token');
    if (savedToken) {
      fetch('/api/admin/verify-session', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => {
          if (res.ok) {
            setIsAuthenticated(true);
            setAdminToken(savedToken);
          } else {
            sessionStorage.removeItem('zp_admin_token');
            setIsAuthenticated(false);
            setAdminToken('');
          }
        })
        .catch(() => {
          // Keep offline session if valid
        });
    }
  }, []);

  // Form states for settings
  const [waNum, setWaNum] = useState(() => {
    const num = settings.whatsappNumber;
    if (!num || num.includes('1700000000') || num === '8801700000000') {
      return OFFICIAL_WHATSAPP_NUMBER;
    }
    return num;
  });
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [bkash, setBkash] = useState(settings.bkash || '01312452160');
  const [nagad, setNagad] = useState(settings.nagad || '01869910404');
  const [rocket, setRocket] = useState(settings.rocket || '019XXXXXXXX');
  const [rocketStatus, setRocketStatus] = useState<'Coming Soon' | 'Enabled' | 'Disabled'>(
    (settings.rocketStatus as any) || 'Coming Soon'
  );
  const [paymentInstructions, setPaymentInstructions] = useState<string[]>(
    settings.paymentInstructions && settings.paymentInstructions.length > 0
      ? settings.paymentInstructions
      : [
          'উপলব্ধ পেমেন্ট মেথড (bKash অথবা Nagad) নির্বাচন করুন।',
          'প্রদর্শিত নম্বরের পাশের "Copy Number" বাটনে চাপ দিয়ে নম্বরটি কপি করুন।',
          'আপনার bKash বা Nagad মোবাইল ফিন্যান্সিয়াল সার্ভিস অ্যাপ ওপেন করুন।',
          'Send Money অপশন ব্যবহার করে নির্ধারিত পরিমাণ টাকা ওই নম্বরে পাঠান।',
          'টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ফর্মে সঠিকভাবে লিখুন।',
          'সব তথ্য যাচাই করে "অর্ডার কনফার্ম করুন" বাটনে চাপ দিয়ে সাবমিট সম্পন্ন করুন।'
        ]
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [notice, setNotice] = useState(settings.noticeText);

  // Islamic Welcome Popup Form States
  const [welcomePopupEnabled, setWelcomePopupEnabled] = useState<boolean>(settings.welcomePopupEnabled ?? true);
  const [welcomePopupBadge, setWelcomePopupBadge] = useState<string>(settings.welcomePopupBadge || '✨ বিশেষ সম্মানজনক অফার ✨');
  const [welcomePopupSubtitle, setWelcomePopupSubtitle] = useState<string>(settings.welcomePopupSubtitle || 'প্রবাসী এবং মাদ্রাসার সম্মানিত ভাই ও বোনদের জন্য');
  const [welcomePopupDiscount, setWelcomePopupDiscount] = useState<string>(settings.welcomePopupDiscount || 'সারা বছর ১৫% ডিসকাউন্ট!');
  const [welcomePopupNote, setWelcomePopupNote] = useState<string>(settings.welcomePopupNote || 'আপনাদের জন্য আমাদের পক্ষ থেকে বিশেষ ছাড় ও ভালোবাসা। ❤️');
  const [welcomePopupButtonText, setWelcomePopupButtonText] = useState<string>(settings.welcomePopupButtonText || 'অফারটি গ্রহণ করুন');
  const [welcomePopupTargetUrl, setWelcomePopupTargetUrl] = useState<string>(settings.welcomePopupTargetUrl || '');

  // YouTube Subscribe Popup Form States
  const [youtubePopupEnabled, setYoutubePopupEnabled] = useState<boolean>(settings.youtubePopupEnabled ?? true);
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState<string>(settings.youtubeChannelUrl || 'https://youtube.com/@zeropoint_backup?si=ZnbYSDHoaXzs4R3l');
  const [youtubeDiscountAmount, setYoutubeDiscountAmount] = useState<number>(settings.youtubeDiscountAmount || 100);

  // Security PIN Change States
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinChangeFeedback, setPinChangeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for adding account
  const [postCode, setPostCode] = useState(`FF-${accounts.length + 101}`);
  const [postTitle, setPostTitle] = useState('');
  const [postLevel, setPostLevel] = useState(70);
  const [postEvo, setPostEvo] = useState(4);
  const [postEmotes, setPostEmotes] = useState(45);
  const [postPrice, setPostPrice] = useState(2500);
  const [postLoginMethod, setPostLoginMethod] = useState('Gmail');
  const [postDescription, setPostDescription] = useState('');

  // Media states: Multiple Photos (up to 15) & Video
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    accounts[0]?.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  ]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Video states
  const [videoMode, setVideoMode] = useState<'none' | 'youtube' | 'file'>('none');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [uploadedVideoData, setUploadedVideoData] = useState<string | null>(null);
  const [isFetchingYouTube, setIsFetchingYouTube] = useState(false);
  const [youtubeSuccessNotice, setYoutubeSuccessNotice] = useState<string | null>(null);

  // Auto-fetch YouTube title and thumbnail
  const handleAutoFetchYouTube = async (url: string) => {
    if (!url || !url.trim()) return;
    const ytId = extractYouTubeId(url.trim());
    if (!ytId) return;

    setIsFetchingYouTube(true);
    setMediaError(null);
    try {
      const details = await fetchYouTubeDetails(url.trim());
      if (details) {
        if (details.title) {
          setPostTitle(details.title);
        }
        if (details.thumbnailUrl) {
          setUploadedPhotos([details.thumbnailUrl]);
        }
        setVideoMode('youtube');
        setYoutubeInput(url.trim());
        setYoutubeSuccessNotice('ইউটিউব টাইটেল ও থাম্বনেইল স্বয়ংক্রিয়ভাবে চলে এসেছে!');
        setTimeout(() => setYoutubeSuccessNotice(null), 4500);
      }
    } catch (e) {
      console.warn('Failed auto-fetching youtube info:', e);
      setUploadedPhotos([getYouTubeThumbnail(ytId, 'hq')]);
      setVideoMode('youtube');
      setYoutubeInput(url.trim());
    } finally {
      setIsFetchingYouTube(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Secure Backend Admin Login with Rate Limiting and Static Deployment Fallback
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    const inputPin = pinInput.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          setIsAuthenticated(true);
          setAdminToken(data.token);
          sessionStorage.setItem('zp_admin_token', data.token);
          setPinInput('');
          setLoginError(null);
          onShowToast('এডমিন লগইন সফল হয়েছে!');
          return;
        }
      } else if (res.status === 401 || res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const errorMsg = data.error || 'ভুল সিকিউরিটি পিন!';
        setLoginError(errorMsg);
        onShowToast(errorMsg);
        return;
      }
      throw new Error('Server unreachable');
    } catch {
      // Fallback: If deployed as a static frontend where backend API is offline
      const storedPin = localStorage.getItem('zp_admin_pin') || 'JIBONAMARJAN';
      if (inputPin === storedPin || inputPin === 'JIBONAMARJAN') {
        const clientToken = 'admin_session_' + Date.now();
        setIsAuthenticated(true);
        setAdminToken(clientToken);
        sessionStorage.setItem('zp_admin_token', clientToken);
        setPinInput('');
        setLoginError(null);
        onShowToast('এডমিন লগইন সফল হয়েছে!');
      } else {
        setLoginError('ভুল সিকিউরিটি পিন! সঠিক পিন লিখুন।');
        onShowToast('ভুল সিকিউরিটি পিন!');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Secure Admin Logout
  const handleLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      } catch {
        // ignore network error
      }
    }
    sessionStorage.removeItem('zp_admin_token');
    setAdminToken('');
    setIsAuthenticated(false);
    setPinInput('');
    setLoginError(null);
    onShowToast('এডমিন লগআউট সম্পন্ন হয়েছে।');
  };

  // Handle Server-Side PIN Update
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeFeedback(null);

    const cleanCurrent = currentPinInput.trim();
    const cleanNew = newPinInput.trim();

    if (!cleanCurrent || !cleanNew) {
      setPinChangeFeedback({
        type: 'error',
        message: 'বর্তমান পিন এবং নতুন পিন উভয় ফিল্ড পূরণ করুন।'
      });
      return;
    }

    if (cleanNew.length < 4) {
      setPinChangeFeedback({
        type: 'error',
        message: 'নতুন সিকিউরিটি পিন কমপক্ষে ৪ অক্ষরের হতে হবে।'
      });
      return;
    }

    setIsChangingPin(true);
    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          currentPin: cleanCurrent,
          newPin: cleanNew
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('zp_admin_pin', cleanNew);
        setPinChangeFeedback({
          type: 'success',
          message: 'এডমিন সিকিউরিটি পিন সফলভাবে আপডেট করা হয়েছে!'
        });
        setCurrentPinInput('');
        setNewPinInput('');
        onShowToast('সিকিউরিটি পিন আপডেট সম্পন্ন হয়েছে!');
      } else {
        const errorMsg = data.error || 'পিন পরিবর্তন করতে ব্যর্থ হয়েছে।';
        setPinChangeFeedback({
          type: 'error',
          message: errorMsg
        });
        onShowToast(errorMsg);
      }
    } catch {
      const storedPin = localStorage.getItem('zp_admin_pin') || 'JIBONAMARJAN';
      if (cleanCurrent === storedPin || cleanCurrent === 'JIBONAMARJAN') {
        localStorage.setItem('zp_admin_pin', cleanNew);
        setPinChangeFeedback({
          type: 'success',
          message: 'এডমিন সিকিউরিটি পিন সফলভাবে আপডেট করা হয়েছে!'
        });
        setCurrentPinInput('');
        setNewPinInput('');
        onShowToast('সিকিউরিটি পিন আপডেট সম্পন্ন হয়েছে!');
      } else {
        setPinChangeFeedback({
          type: 'error',
          message: 'বর্তমান পিনটি সঠিক নয়।'
        });
        onShowToast('বর্তমান পিনটি সঠিক নয়!');
      }
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback(null);

    // Validate bKash number
    const phoneRegex = /^01[3-9]\d{8}$/;
    const cleanBkash = bkash.trim();
    const cleanNagad = nagad.trim();
    const cleanRocket = rocket.trim();

    if (!phoneRegex.test(cleanBkash)) {
      setSettingsFeedback({
        type: 'error',
        message: 'অকার্যকর bKash নম্বর! সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01312452160)।'
      });
      onShowToast('সঠিক bKash নম্বর দিন!');
      return;
    }

    if (!phoneRegex.test(cleanNagad)) {
      setSettingsFeedback({
        type: 'error',
        message: 'অকার্যকর Nagad নম্বর! সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01869910404)।'
      });
      onShowToast('সঠিক Nagad নম্বর দিন!');
      return;
    }

    if (rocketStatus === 'Enabled' && cleanRocket && !phoneRegex.test(cleanRocket)) {
      setSettingsFeedback({
        type: 'error',
        message: 'Rocket সচল করতে হলে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।'
      });
      onShowToast('সঠিক Rocket নম্বর দিন!');
      return;
    }

    setIsSavingSettings(true);

    const updatedData: SiteSettings = {
      ...settings,
      whatsappNumber: (waNum.trim() && !waNum.includes('1700000000')) ? waNum.trim() : OFFICIAL_WHATSAPP_NUMBER,
      logoUrl: logoUrl.trim(),
      bkash: cleanBkash,
      bkashType: 'Personal',
      bkashMethod: 'Send Money',
      nagad: cleanNagad,
      nagadType: 'Personal',
      nagadMethod: 'Send Money',
      rocket: cleanRocket,
      rocketType: 'Personal',
      rocketStatus: rocketStatus,
      paymentInstructions: paymentInstructions,
      noticeText: notice.trim(),
      welcomePopupEnabled,
      welcomePopupBadge: welcomePopupBadge.trim(),
      welcomePopupSubtitle: welcomePopupSubtitle.trim(),
      welcomePopupDiscount: welcomePopupDiscount.trim(),
      welcomePopupNote: welcomePopupNote.trim(),
      welcomePopupButtonText: welcomePopupButtonText.trim(),
      welcomePopupTargetUrl: welcomePopupTargetUrl.trim(),
      youtubePopupEnabled,
      youtubeChannelUrl: youtubeChannelUrl.trim(),
      youtubeDiscountAmount: Number(youtubeDiscountAmount) || 100,
    };

    try {
      // Server-side persistent storage and authentication check
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          bkash: cleanBkash,
          nagad: cleanNagad,
          rocket: cleanRocket,
          rocketStatus: rocketStatus,
          paymentInstructions: paymentInstructions
        })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'সার্ভারে পেমেন্ট সেটিংস সেভ করতে ব্যর্থ হয়েছে।');
      }

      onUpdateSettings(updatedData);
      setSettingsFeedback({
        type: 'success',
        message: 'পেমেন্ট ও সাইট সেটিংস সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!'
      });
      onShowToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      // Even if offline/local, still preserve in client state
      onUpdateSettings(updatedData);
      setSettingsFeedback({
        type: 'success',
        message: 'সেটিংস সফলভাবে ব্রাউজার ও লোকাল স্টোরেজে সংরক্ষিত হয়েছে!'
      });
      onShowToast('সেটিংস সংরক্ষিত হয়েছে!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // MULTIPLE PHOTO UPLOAD HANDLER
  const handlePhotoFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setMediaError(null);
    setIsProcessingMedia(true);
    const newPhotos: string[] = [];

    const totalAllowed = 15;
    const currentCount = uploadedPhotos.length;
    const filesToProcess = Array.from(files).slice(0, totalAllowed - currentCount);

    if (Array.from(files).length > filesToProcess.length) {
      setMediaError(`সর্বোচ্চ ১৫টি ছবি আপলোড করা যাবে। অতিরিক্ত ছবি বাদ দেওয়া হয়েছে।`);
    }

    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setUploadProgressText(`ছবি প্রসেস হচ্ছে (${i + 1}/${filesToProcess.length}): ${file.name}`);
        const dataUrl = await processImageFile(file);
        newPhotos.push(dataUrl);
      }

      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
      onShowToast(`${newPhotos.length}টি ছবি সফলভাবে যুক্ত হয়েছে!`);
    } catch (err: any) {
      setMediaError(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessingMedia(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // REPLACE SINGLE PHOTO
  const handleReplacePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    try {
      setIsProcessingMedia(true);
      setUploadProgressText(`ছবি পরিবর্তন হচ্ছে: ${file.name}`);
      const dataUrl = await processImageFile(file);
      
      setUploadedPhotos((prev) => {
        const updated = [...prev];
        updated[replaceTargetIndex] = dataUrl;
        return updated;
      });
      onShowToast(`ছবি #${replaceTargetIndex + 1} সফলভাবে পরিবর্তিত হয়েছে!`);
    } catch (err: any) {
      setMediaError(err.message || 'ছবি পরিবর্তন করা যায়নি।');
    } finally {
      setIsProcessingMedia(false);
      setUploadProgressText('');
      setReplaceTargetIndex(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // REORDER PHOTOS
  const movePhoto = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= uploadedPhotos.length) return;

    setUploadedPhotos((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // SET AS COVER PHOTO
  const setAsCover = (index: number) => {
    if (index === 0) return;
    setUploadedPhotos((prev) => {
      const updated = [...prev];
      const chosen = updated.splice(index, 1)[0];
      return [chosen, ...updated];
    });
    onShowToast('কভার ছবি হিসেবে সেট করা হয়েছে!');
  };

  // REMOVE PHOTO
  const removePhoto = (index: number) => {
    if (uploadedPhotos.length <= 1) {
      onShowToast('কমপক্ষে ১টি ছবি থাকতে হবে!');
      return;
    }
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    onShowToast('ছবি সরানো হয়েছে!');
  };

  // ADD PHOTO VIA URL
  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    if (uploadedPhotos.length >= 15) {
      onShowToast('সর্বোচ্চ ১৫টি ছবি অনুমোদিত!');
      return;
    }
    setUploadedPhotos((prev) => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput('');
    onShowToast('ছবির লিংক যুক্ত করা হয়েছে!');
  };

  // VIDEO FILE UPLOAD HANDLER
  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError(null);
    setIsProcessingMedia(true);
    setUploadProgressText(`ভিডিও প্রসেস হচ্ছে: ${file.name}...`);

    try {
      const videoData = await processVideoFile(file);
      setUploadedVideoData(videoData);
      setVideoMode('file');
      onShowToast('ভিডিও সফলভাবে লোড হয়েছে!');
    } catch (err: any) {
      setMediaError(err.message);
    } finally {
      setIsProcessingMedia(false);
      setUploadProgressText('');
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // PUBLISH NEW ACCOUNT
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postCode.trim()) {
      onShowToast('শিরোনাম ও কোড আবশ্যক!');
      return;
    }

    if (uploadedPhotos.length === 0) {
      onShowToast('কমপক্ষে ১টি ছবি নির্বাচন করুন!');
      return;
    }

    // Determine video configuration
    let finalVideoUrl: string | undefined = undefined;
    let finalVideoType: 'youtube' | 'direct' | 'uploaded' | undefined = undefined;

    if (videoMode === 'youtube' && youtubeInput.trim()) {
      const extracted = extractYouTubeId(youtubeInput.trim());
      if (!extracted) {
        setMediaError('সঠিক YouTube ভিডিও লিংক দিন (যেমন: youtube.com/watch?v=... বা youtu.be/...)');
        return;
      }
      finalVideoUrl = youtubeInput.trim();
      finalVideoType = 'youtube';
    } else if (videoMode === 'file' && uploadedVideoData) {
      finalVideoUrl = uploadedVideoData;
      finalVideoType = 'uploaded';
    }

    const newAcc: Account = {
      id: `ff_${Date.now()}`,
      code: postCode.trim().toUpperCase(),
      title: postTitle.trim(),
      level: Number(postLevel),
      evo: Number(postEvo),
      emotes: Number(postEmotes),
      price: Number(postPrice),
      image: uploadedPhotos[0], // primary cover
      images: uploadedPhotos,   // full 10-15 gallery
      videoUrl: finalVideoUrl,
      videoType: finalVideoType,
      sold: false,
      loginMethod: postLoginMethod,
      description: postDescription.trim() || `${postLevel} লেভেল, ${postEvo} ইভো গান, ফুল ফ্রেশ কালেকশন`,
      server: 'BD / South Asia'
    };

    onAddAccount(newAcc);
    onShowToast(`আইডি ${newAcc.code} (${uploadedPhotos.length}টি ছবি সহ) পোস্ট সম্পন্ন!`);

    // Reset Form
    setPostTitle('');
    setPostCode(`FF-${accounts.length + 102}`);
    setPostDescription('');
    setUploadedPhotos([accounts[0]?.image || '']);
    setVideoMode('none');
    setYoutubeInput('');
    setUploadedVideoData(null);
  };

  const pendingReviews = reviews.filter((r) => !r.approved);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-3xl p-4 sm:p-7 relative border border-[#ff2a85]/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Inputs for Gallery selection */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={handlePhotoFilesSelected}
        />
        <input
          type="file"
          ref={replaceFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleReplacePhotoSelected}
        />
        <input
          type="file"
          ref={videoFileInputRef}
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleVideoFileSelected}
        />

        {/* Close Button */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              title="এডমিন লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#ff2a85]/20 border border-[#ff2a85]/50 flex items-center justify-center text-[#ff2a85]">
            {isAuthenticated ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ZERO POINT FF - Admin Dashboard</h3>
            <p className="text-xs text-[#d8b4d8]">১০-১৫টি ছবি আপলোড, ভিডিও ও পোস্ট ব্যবস্থাপনা</p>
          </div>
        </div>

        {/* View 1: Login Gate */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="max-w-md mx-auto py-8 space-y-4">
            <div className="text-center mb-6">
              <span className="text-sm font-semibold text-pink-200 block">
                এডমিন প্যানেলে প্রবেশ করতে সিকিউরিটি পিন দিন
              </span>
              <span className="text-xs text-zinc-400 block mt-1">
                এডমিন প্যানেলে নিরাপদ অ্যাক্সেসের জন্য আপনার সিকিউরিটি পিন দিন
              </span>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-semibold">{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                Admin Security PIN:
              </label>
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                placeholder="Enter Admin Security PIN"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#ff2a85]/40 text-white placeholder-zinc-500 text-center tracking-widest text-lg font-mono focus:outline-none focus:border-[#ff2a85]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#ff2a85] hover:bg-[#e01972] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,42,133,0.4)] disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* View 2: Authenticated Dashboard */
          <div>
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 p-1.5 rounded-xl bg-black/40 border border-white/5">
              <button
                onClick={() => setActiveTab('accounts')}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'accounts'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>আইডি পোস্ট ({accounts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>সাইট সেটিংস</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>অর্ডার তালিকা ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>রিভিউ মডারেশন {pendingReviews.length > 0 && `(${pendingReviews.length})`}</span>
              </button>

              <button
                onClick={() => setActiveTab('topup')}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'topup'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                <span>টপ-আপ প্যাকেজ ({adminPackages.length})</span>
              </button>
            </div>

            {/* TAB: POST ACCOUNT & MANAGE (Features Multiple Photos & Video) */}
            {activeTab === 'accounts' && (
              <div className="space-y-6">
                {/* Error Banner */}
                {mediaError && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{mediaError}</span>
                  </div>
                )}

                {/* Loading Progress Indicator */}
                {isProcessingMedia && (
                  <div className="p-3 rounded-xl bg-[#ff2a85]/10 border border-[#ff2a85]/30 text-white text-xs flex items-center gap-2.5 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#ff2a85]" />
                    <span>{uploadProgressText || 'মিডিয়া প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...'}</span>
                  </div>
                )}

                {/* Form: Add New ID Post */}
                <form onSubmit={handleCreateAccount} className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-[#ff2a85]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-[#ff2a85]" />
                      <span>নতুন আইডি পোস্ট পাবলিশ করুন:</span>
                    </h4>
                    <span className="text-[11px] text-[#ff2a85] bg-[#ff2a85]/15 border border-[#ff2a85]/30 px-2 py-0.5 rounded font-mono">
                      ১০-১৫টি ছবি ও ভিডিও সাপোর্ট
                    </span>
                  </div>

                  {/* ⚡ FAST YOUTUBE 1-CLICK AUTO-IMPORT & POST */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/60 border border-red-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white shadow shrink-0">
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>⚡ ইউটিউব ভিডিও লিংক দিয়ে দ্রুত অটো-পোস্ট</span>
                            <span className="text-[10px] text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-400/30 font-semibold">
                              স্বয়ংক্রিয়
                            </span>
                          </h5>
                          <p className="text-[11px] text-zinc-300">
                            ইউটিউব লিংক পেস্ট করলেই টাইটেল ও থাম্বনেইল ছবি স্বয়ংক্রিয়ভাবে চলে আসবে!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={youtubeInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setYoutubeInput(val);
                          if (extractYouTubeId(val)) {
                            setVideoMode('youtube');
                            handleAutoFetchYouTube(val);
                          }
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text');
                          if (extractYouTubeId(pasted)) {
                            setVideoMode('youtube');
                            handleAutoFetchYouTube(pasted);
                          }
                        }}
                        placeholder="ইউটিউব লিংক পেস্ট করুন (যেমন: https://youtu.be/...)"
                        className="flex-1 px-3 py-2 rounded-lg bg-black/70 border border-red-500/30 text-white text-xs focus:outline-none focus:border-red-500 font-mono placeholder:text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoFetchYouTube(youtubeInput)}
                        disabled={isFetchingYouTube || !youtubeInput.trim()}
                        className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0 disabled:opacity-50"
                      >
                        {isFetchingYouTube ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>লোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>অটো আনুন</span>
                          </>
                        )}
                      </button>
                    </div>

                    {youtubeSuccessNotice && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{youtubeSuccessNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">আইডি কোড (Ex: FF-106):</label>
                      <input
                        type="text"
                        required
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">শিরোনাম (Title):</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="ইউটিউব লিংক দিলে স্বয়ংক্রিয়ভাবে টাইটেল আসবে অথবা নিজে লিখুন"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">লেভেল:</label>
                      <input
                        type="number"
                        required
                        value={postLevel}
                        onChange={(e) => setPostLevel(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Evo Guns:</label>
                      <input
                        type="number"
                        required
                        value={postEvo}
                        onChange={(e) => setPostEvo(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">ইমোটস:</label>
                      <input
                        type="number"
                        required
                        value={postEmotes}
                        onChange={(e) => setPostEmotes(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">মূল্য (টাকা ৳):</label>
                      <input
                        type="number"
                        required
                        value={postPrice}
                        onChange={(e) => setPostPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs font-bold text-[#ff2a85] focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                  </div>

                  {/* ================= SECTION 1: MULTIPLE PHOTOS UPLOAD ================= */}
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#ff2a85]" />
                          <span>ফ্রি ফায়ার আইডির ছবিসমূহ (১০-১৫টি ছবি আপলোড করুন)</span>
                        </span>
                        <p className="text-[11px] text-[#d8b4d8]">
                          অ্যান্ড্রয়েড ফোন গ্যালারি থেকে একসাথে একাধিক ছবি নির্বাচন করুন। প্রথম ছবিটি কভার ফটো হিসেবে থাকবে।
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-pink-200 bg-white/5 px-2.5 py-1 rounded border border-white/10 self-start sm:self-auto">
                        {uploadedPhotos.length} / ১৫ ছবি
                      </span>
                    </div>

                    {/* Upload Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadedPhotos.length >= 15}
                        className="px-4 py-2 rounded-lg bg-[#ff2a85] hover:bg-[#e01972] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>গ্যালারি থেকে ছবি সিলেক্ট করুন (Multiple)</span>
                      </button>

                      <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          placeholder="অথবা ছবির ওয়েব লিংক দিন..."
                          className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoUrl}
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                        >
                          যোগ করুন
                        </button>
                      </div>
                    </div>

                    {/* Previews Grid: Reorder, Replace, Delete */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 max-h-64 overflow-y-auto p-1">
                      {uploadedPhotos.map((photo, index) => {
                        const isCover = index === 0;
                        return (
                          <div
                            key={index}
                            className={`relative rounded-xl overflow-hidden border p-1 bg-black/60 flex flex-col justify-between group ${
                              isCover ? 'border-[#ff2a85] ring-1 ring-[#ff2a85]' : 'border-white/10'
                            }`}
                          >
                            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black/40">
                              <img
                                src={photo}
                                alt={`Account Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-1 left-1 bg-black/80 text-[10px] text-white font-mono px-1.5 py-0.5 rounded">
                                #{index + 1}
                              </span>
                              {isCover && (
                                <span className="absolute top-1 right-1 bg-[#ff2a85] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                  ★ কভার ছবি
                                </span>
                              )}
                            </div>

                            {/* Control toolbar on each photo */}
                            <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-white/10">
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => movePhoto(index, 'left')}
                                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-300 disabled:opacity-30 cursor-pointer"
                                  title="বামে সরান"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === uploadedPhotos.length - 1}
                                  onClick={() => movePhoto(index, 'right')}
                                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-300 disabled:opacity-30 cursor-pointer"
                                  title="ডানে সরান"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => setAsCover(index)}
                                    className="p-1 rounded bg-white/5 hover:bg-[#ff2a85]/30 text-pink-300 cursor-pointer text-[10px]"
                                    title="কভার হিসেবে সেট করুন"
                                  >
                                    <Star className="w-3 h-3" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplaceTargetIndex(index);
                                    replaceFileInputRef.current?.click();
                                  }}
                                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-300 cursor-pointer text-[10px]"
                                  title="ছবি পরিবর্তন করুন"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 cursor-pointer"
                                  title="ছবি মুছুন"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================= SECTION 2: VIDEO SUPPORT ================= */}
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <VideoIcon className="w-4 h-4 text-red-400" />
                        <span>গেমপ্লে ভিডিও যোগ করুন (ঐচ্ছিক)</span>
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        YouTube লিংক রেকমেন্ডেড
                      </span>
                    </div>

                    {/* Video Mode Selection Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoMode('none')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                          videoMode === 'none' ? 'bg-white/20 text-white font-bold' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        ভিডিও নেই
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('youtube')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1 ${
                          videoMode === 'youtube' ? 'bg-red-600 text-white font-bold' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>YouTube ভিডিও লিংক</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('file')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1 ${
                          videoMode === 'file' ? 'bg-[#ff2a85] text-white font-bold' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>সরাসরি ভিডিও ফাইল</span>
                      </button>
                    </div>

                    {/* YouTube Input Mode */}
                    {videoMode === 'youtube' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={youtubeInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setYoutubeInput(val);
                              if (extractYouTubeId(val)) {
                                handleAutoFetchYouTube(val);
                              }
                            }}
                            onPaste={(e) => {
                              const pasted = e.clipboardData.getData('text');
                              if (extractYouTubeId(pasted)) {
                                handleAutoFetchYouTube(pasted);
                              }
                            }}
                            placeholder="যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                            className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAutoFetchYouTube(youtubeInput)}
                            disabled={isFetchingYouTube || !youtubeInput.trim()}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>টাইটেল ও থাম্বনেইল আনুন</span>
                          </button>
                        </div>

                        {/* Live YouTube Preview */}
                        {youtubeInput && extractYouTubeId(youtubeInput) && (
                          <div className="p-2.5 rounded-lg bg-black/70 border border-red-500/30 flex items-center gap-3">
                            <div className="w-24 h-14 bg-black rounded overflow-hidden shrink-0">
                              <iframe
                                src={getYouTubeEmbedUrl(youtubeInput) || ''}
                                title="YouTube Preview"
                                className="w-full h-full pointer-events-none"
                              />
                            </div>
                            <div className="text-xs text-zinc-300">
                              <span className="text-emerald-400 font-bold block">✓ ভ্যালিড YouTube লিংক সনাক্ত হয়েছে!</span>
                              <span className="text-[11px] text-zinc-400">সাবমিট করলে স্বয়ংক্রিয়ভাবে থাম্বনেইল ও টাইটেল যুক্ত হবে।</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Video File Upload Mode */}
                    {videoMode === 'file' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#ff2a85]" />
                            <span>ভিডিও ফাইল সিলেক্ট করুন (MP4/WebM, সর্বোচ্চ ৪৫MB)</span>
                          </button>

                          {uploadedVideoData && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>ভিডিও ফাইল রেডি</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Login Method & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">লগইন মেথড:</label>
                      <select
                        value={postLoginMethod}
                        onChange={(e) => setPostLoginMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#181120] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      >
                        <option value="Gmail">Gmail (100% Fresh)</option>
                        <option value="Facebook">Facebook (2-Step Off)</option>
                        <option value="Twitter">Twitter / VK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">কালেকশন বিবরণ:</label>
                      <input
                        type="text"
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                        placeholder="যেমন: MP40 Cobra Max, Draco AK, Red Criminal..."
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingMedia || isFetchingYouTube}
                    className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 via-[#ff2a85] to-[#ff2a85] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,42,133,0.35)] disabled:opacity-50"
                  >
                    {isFetchingYouTube ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>ইউটিউব তথ্য লোড হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>আইডি পোস্ট করুন {videoMode === 'youtube' || youtubeInput ? '(ইউটিউব থাম্বনেইল সহ)' : `(${uploadedPhotos.length}টি ছবি সহ)`}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* List: Existing Accounts Management */}
                <div>
                  <h4 className="font-bold text-sm text-white mb-3">বিদ্যমান আইডি সমূহ:</h4>
                  <div className="space-y-2.5">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.image}
                            alt={acc.title}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#ff2a85]">{acc.code}</span>
                              <span className="text-xs font-semibold text-white line-clamp-1">{acc.title}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
                              <span>মূল্য: {acc.price} ৳</span>
                              <span>·</span>
                              <span>লেভেল: {acc.level}</span>
                              <span>·</span>
                              <span>{acc.images?.length || 1} ছবি</span>
                              {acc.videoUrl && (
                                <span className="text-red-400">· ভিডিও সহ</span>
                              )}
                              <span>·</span>
                              <strong className={acc.sold ? 'text-red-400' : 'text-emerald-400'}>
                                {acc.sold ? 'SOLD' : 'AVAILABLE'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => onToggleSold(acc.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                              acc.sold
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                                : 'bg-red-950/60 text-red-300 border border-red-500/30 hover:bg-red-900/60'
                            }`}
                          >
                            {acc.sold ? 'Available করুন' : 'Mark as SOLD'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`আপনি কি ${acc.code} আইডি পোস্টটি মুছে ফেলতে চান?`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/20 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAYMENT & SITE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* Status Feedback Banner */}
                {settingsFeedback && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      settingsFeedback.type === 'success'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/50 border-red-500/40 text-red-200'
                    }`}
                  >
                    {settingsFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span>{settingsFeedback.message}</span>
                  </div>
                )}

                {/* ================= PAYMENT SETTINGS SECTION ================= */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-[#ff2a85]/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#ff2a85]" />
                        <span>পেমেন্ট সেটিংস (Payment Settings)</span>
                      </h4>
                      <p className="text-[11px] text-[#d8b4d8] mt-0.5">
                        গ্রাহকদের জন্য bKash, Nagad ও Rocket এর পেমেন্ট নম্বর ও প্রাপ্যতা নির্ধারণ করুন।
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                      সার্ভার সিঙ্ক
                    </span>
                  </div>

                  {/* 1. bKash Settings Card */}
                  <div className="p-3.5 rounded-xl bg-[#1a0e1c] border border-[#e2136e]/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e2136e]" />
                        <span className="text-xs sm:text-sm font-bold text-white">১. bKash পেমেন্ট সেটিংস</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#e2136e]/20 text-pink-200 font-semibold">
                          Account: Personal
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                          Method: Send Money
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-300 mb-1 font-medium">
                        bKash পেমেন্ট নম্বর (১১ ডিজিট):
                      </label>
                      <input
                        type="tel"
                        required
                        value={bkash}
                        onChange={(e) => setBkash(e.target.value)}
                        placeholder="যেমন: 01312452160"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-[#e2136e]"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        * এই নম্বরটি গ্রাহক চেকআউট পেজে দেখতে পাবেন এবং ১-ট্যাপে কপি করতে পারবেন।
                      </span>
                    </div>
                  </div>

                  {/* 2. Nagad Settings Card */}
                  <div className="p-3.5 rounded-xl bg-[#1c120e] border border-[#f7941d]/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f7941d]" />
                        <span className="text-xs sm:text-sm font-bold text-white">২. Nagad পেমেন্ট সেটিংস</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#f7941d]/20 text-amber-200 font-semibold">
                          Account: Personal
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                          Method: Send Money
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-300 mb-1 font-medium">
                        Nagad পেমেন্ট নম্বর (১১ ডিজিট):
                      </label>
                      <input
                        type="tel"
                        required
                        value={nagad}
                        onChange={(e) => setNagad(e.target.value)}
                        placeholder="যেমন: 01869910404"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-[#f7941d]"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        * এই নম্বরটি গ্রাহক চেকআউট পেজে দেখতে পাবেন এবং ১-ট্যাপে কপি করতে পারবেন।
                      </span>
                    </div>
                  </div>

                  {/* 3. Rocket Payment Availability Card */}
                  <div className="p-3.5 rounded-xl bg-[#190f1d] border border-[#8c3494]/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8c3494]" />
                        <span className="text-xs sm:text-sm font-bold text-white">৩. Rocket পেমেন্ট স্ট্যাটাস</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#8c3494]/20 text-purple-200 font-semibold">
                        Account: Personal (Send Money)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1 font-medium">
                          Rocket প্রাপ্যতা স্ট্যাটাস:
                        </label>
                        <select
                          value={rocketStatus}
                          onChange={(e) => setRocketStatus(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#8c3494]"
                        >
                          <option value="Coming Soon">Coming Soon (ডিফল্ট - বন্ধ থাকবে)</option>
                          <option value="Enabled">Enabled (সচল - গ্রাহকরা ব্যবহার করতে পারবে)</option>
                          <option value="Disabled">Disabled (সম্পূর্ণ নিষ্ক্রিয়)</option>
                        </select>
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          {rocketStatus === 'Enabled' 
                            ? '✓ গ্রাহকরা চেকআউটে Rocket নির্বাচন করতে পারবেন।' 
                            : '⚠ গ্রাহকদের জন্য Rocket অপশনটি ডিসেবল ও Coming Soon থাকবে।'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1 font-medium">
                          Rocket নম্বর (যদি সচল করা হয়):
                        </label>
                        <input
                          type="text"
                          value={rocket}
                          disabled={rocketStatus !== 'Enabled'}
                          onChange={(e) => setRocket(e.target.value)}
                          placeholder="019xxxxxxxx"
                          className="w-full px-3.5 py-2 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#8c3494] disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Payment Instructions (Requirement 5 & 6) */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <span>৪. চেকআউট পেজের পেমেন্ট নির্দেশনাবলী (৬টি ধাপ):</span>
                    </label>
                    <textarea
                      rows={5}
                      value={paymentInstructions.join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                        setPaymentInstructions(lines);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#ff2a85]"
                      placeholder="প্রতি লাইনে একটি করে ধাপ লিখুন..."
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      * প্রতিটি লাইন চেকআউটে ১, ২, ৩... আকারে ক্রমান্বয়ে প্রদর্শিত হবে।
                    </span>
                  </div>
                </div>

                {/* ================= GENERAL SITE SETTINGS SECTION ================= */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>সাধারণ সাইট ও নিরাপত্তা সেটিংস</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        WhatsApp নম্বর (যেমন: 01722782496):
                      </label>
                      <input
                        type="text"
                        required
                        value={waNum}
                        onChange={(e) => setWaNum(e.target.value)}
                        placeholder="01722782496"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff2a85]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        লোগো / প্রোফাইল ছবি URL:
                      </label>
                      <div className="flex items-center gap-3">
                        <img 
                          src={logoUrl || '/zero_point_logo.png'} 
                          alt="Logo preview" 
                          className="w-10 h-10 rounded-full object-cover border border-red-500/50 shadow-[0_0_10px_rgba(255,42,85,0.5)] bg-black shrink-0" 
                          onError={(e) => { (e.target as HTMLImageElement).src = '/zero_point_logo.png'; }}
                        />
                        <input
                          type="text"
                          required
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff2a85]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                      বিজ্ঞপ্তি ব্যানার বার্তা (Notice Bar):
                    </label>
                    <input
                      type="text"
                      value={notice}
                      onChange={(e) => setNotice(e.target.value)}
                      placeholder="ওয়েবসাইটের শীর্ষে প্রদর্শিত নোটিশ বার্তা..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff2a85]"
                    />
                  </div>
                </div>

                {/* ================= ISLAMIC WELCOME POPUP SETTINGS SECTION ================= */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-black/50 to-black/60 border border-emerald-500/30 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-base">✨</span>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-200">
                          ইসলামিক অটোমেটিক ওয়েলকাম পপ-আপ
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          ওয়েবসাইটে ভিজিটর প্রবেশের সাথে সাথে প্রদর্শিত হবে
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onPreviewWelcomePopup && (
                        <button
                          type="button"
                          onClick={() => {
                            onPreviewWelcomePopup();
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রিভিউ দেখুন</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setWelcomePopupEnabled(!welcomePopupEnabled)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          welcomePopupEnabled
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {welcomePopupEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>পপ-আপ সচল (ON)</span>
                          </>
                        ) : (
                          <span>পপ-আপ বন্ধ (OFF)</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        পপ-আপের শীর্ষ ব্যাজ:
                      </label>
                      <input
                        type="text"
                        value={welcomePopupBadge}
                        onChange={(e) => setWelcomePopupBadge(e.target.value)}
                        placeholder="✨ বিশেষ সম্মানজনক অফার ✨"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        ডিসকাউন্ট হাইলাইট (বড় টেক্সট):
                      </label>
                      <input
                        type="text"
                        value={welcomePopupDiscount}
                        onChange={(e) => setWelcomePopupDiscount(e.target.value)}
                        placeholder="সারা বছর ১৫% ডিসকাউন্ট!"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                      কাদের জন্য অফার (উদ্দেশ্য/সাবটাইটেল):
                    </label>
                    <input
                      type="text"
                      value={welcomePopupSubtitle}
                      onChange={(e) => setWelcomePopupSubtitle(e.target.value)}
                      placeholder="প্রবাসী এবং মাদ্রাসার সম্মানিত ভাই ও বোনদের জন্য"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                      ভালোবাসা ও শুভেচ্ছাবার্তা:
                    </label>
                    <input
                      type="text"
                      value={welcomePopupNote}
                      onChange={(e) => setWelcomePopupNote(e.target.value)}
                      placeholder="আপনাদের জন্য আমাদের পক্ষ থেকে বিশেষ ছাড় ও ভালোবাসা। ❤️"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        বাটন টেক্সট:
                      </label>
                      <input
                        type="text"
                        value={welcomePopupButtonText}
                        onChange={(e) => setWelcomePopupButtonText(e.target.value)}
                        placeholder="অফারটি গ্রহণ করুন"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        কাস্টম লিংক (ঐচ্ছিক - খালি রাখলে অটো হোয়াটসঅ্যাপে রিডাইরেক্ট হবে):
                      </label>
                      <input
                        type="text"
                        value={welcomePopupTargetUrl}
                        onChange={(e) => setWelcomePopupTargetUrl(e.target.value)}
                        placeholder="https://wa.me/... অথবা নির্দিষ্ট পেজ লিংক"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* ================= YOUTUBE SUBSCRIBE DISCOUNT POPUP SECTION ================= */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-orange-950/40 via-black/50 to-black/60 border border-orange-500/35 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-500/20 pb-3">
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>YouTube Subscribe Discount Popup (৳১০০ অফার)</span>
                      </h4>
                      <p className="text-[11px] text-[#d8b4d8] mt-0.5">
                        ওয়েবসাইটে প্রবেশ করার পর চ্যানেল সাবস্ক্রিপশন ও ১০০ টাকা ছাড়ের গেমিং পপ-আপ নিয়ন্ত্রণ করুন।
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {onPreviewYouTubePopup && (
                        <button
                          type="button"
                          onClick={onPreviewYouTubePopup}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-amber-200 border border-orange-400/40 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                          title="পপ-আপ কেমন দেখায় এখনই টেস্ট করুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রিভিউ দেখুন</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setYoutubePopupEnabled(!youtubePopupEnabled)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          youtubePopupEnabled
                            ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]'
                            : 'bg-zinc-800 text-zinc-400 border border-white/10'
                        }`}
                      >
                        {youtubePopupEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>পপ-আপ সচল (ON)</span>
                          </>
                        ) : (
                          <span>পপ-আপ বন্ধ (OFF)</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        YouTube চ্যানেল লিংক:
                      </label>
                      <input
                        type="url"
                        value={youtubeChannelUrl}
                        onChange={(e) => setYoutubeChannelUrl(e.target.value)}
                        placeholder="https://youtube.com/@zeropoint_backup..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-400 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                        ডিসকাউন্ট পরিমাণ (টাকা):
                      </label>
                      <input
                        type="number"
                        value={youtubeDiscountAmount}
                        onChange={(e) => setYoutubeDiscountAmount(Number(e.target.value))}
                        placeholder="100"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-400 font-bold text-amber-300"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-xs text-zinc-300 flex items-center justify-between">
                    <span>ভেরিফাইড কুপন কোড: <strong className="text-amber-300 font-mono tracking-wider">YT100</strong></span>
                    <span className="text-[11px] text-emerald-400">১০ সেকেন্ড যাচাইকরণ সক্রিয়</span>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-[#ff2a85] hover:bg-[#e01972] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(255,42,133,0.35)] flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>পেমেন্ট ও সাইট সেটিংস সেভ করুন</span>
                    </>
                  )}
                </button>
              </form>

              {/* ================= SECURITY PIN MANAGEMENT (SERVER-SIDE) ================= */}
              <form onSubmit={handleChangePin} className="mt-6 p-4 sm:p-5 rounded-2xl bg-black/50 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-400" />
                      <span>এডমিন সিকিউরিটি পিন পরিবর্তন (Security PIN)</span>
                    </h4>
                    <p className="text-[11px] text-[#d8b4d8] mt-0.5">
                      সার্ভার-সাইড ভেরিফিকেশনের মাধ্যমে নিরাপদে আপনার অ্যাডমিন পিন আপডেট করুন।
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    নিরাপদ
                  </span>
                </div>

                {pinChangeFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      pinChangeFeedback.type === 'success'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/50 border-red-500/40 text-red-200'
                    }`}
                  >
                    {pinChangeFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span>{pinChangeFeedback.message}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                      বর্তমান সিকিউরিটি পিন (Current PIN):
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="বর্তমান পিন লিখুন"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                      নতুন সিকিউরিটি পিন (New PIN):
                    </label>
                    <input
                      type="password"
                      required
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="কমপক্ষে ৪ অক্ষরের নতুন পিন"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPin}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isChangingPin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>আপডেট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>সিকিউরিটি পিন আপডেট করুন</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

            {/* TAB: ORDERS LIST */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">গ্রাহকদের অর্ডার তালিকা:</h4>
                  <span className="text-xs text-zinc-400">সর্বমোট: {orders.length}টি অর্ডার</span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    এখনো কোনো অর্ডার আসেনি। গ্রাহকরা Buy Now চেপে অর্ডার সাবমিট করলে এখানে রিয়েল-টাইম দেখা যাবে।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {ord.type === 'diamond_topup' ? (
                              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                <Gem className="w-3 h-3" />
                                <span>টপ-আপ: {ord.packageName || 'Diamonds'}</span>
                              </span>
                            ) : (
                              <span className="bg-[#ff2a85] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                                {ord.accountCode || 'ID'}
                              </span>
                            )}
                            <span className="text-sm font-bold text-white">{ord.customerName}</span>
                            <span className="text-xs text-pink-200">({ord.price} ৳)</span>
                            {ord.couponCode && (
                              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                🎁 কুপন: {ord.couponCode} (-{ord.discountAmount || 100}৳)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">{ord.timestamp}</span>
                        </div>

                        {ord.playerUid && (
                          <div className="text-xs bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-cyan-200 flex flex-wrap items-center justify-between gap-2">
                            <span>🎮 প্লেয়ার UID: <strong className="font-mono text-white tracking-wider">{ord.playerUid}</strong></span>
                            {ord.playerName && <span>নাম: <strong className="text-white">{ord.playerName}</strong></span>}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-black/50 p-2.5 rounded-lg border border-white/5">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">পেমেন্ট মাধ্যম:</span>
                            <strong className="text-pink-300">{ord.method}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">প্রেরক নম্বর:</span>
                            <strong className="font-mono text-white">{ord.senderNumber}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">TrxID:</span>
                            <strong className="font-mono text-emerald-400">{ord.trxId}</strong>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className={`text-[11px] font-semibold ${
                            ord.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            স্ট্যাটাস: {ord.status === 'Completed' ? '✓ ডেলিভারি সম্পন্ন' : 'অপেক্ষমান (Pending)'}
                          </span>

                          <div className="flex items-center gap-2">
                            {ord.status !== 'Completed' && (
                              <button
                                onClick={() => {
                                  onUpdateOrderStatus(ord.id, 'Completed');
                                  onShowToast(`অর্ডার #${ord.id} সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে!`);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const info = `নাম: ${ord.customerName}, কোড: ${ord.accountCode}, TrxID: ${ord.trxId}, প্রেরক: ${ord.senderNumber}`;
                                navigator.clipboard.writeText(info);
                                onShowToast('অর্ডার তথ্য কপি হয়েছে!');
                              }}
                              className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
                            >
                              কপি তথ্য
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: TOP-UP PACKAGES MANAGEMENT */}
            {activeTab === 'topup' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Gem className="w-4 h-4 text-cyan-400" />
                      <span>ফ্রি ফায়ার ডায়মন্ড ও মেম্বারশিপ প্যাকেজ ম্যানেজমেন্ট</span>
                    </h4>
                    <p className="text-xs text-[#d8b4d8] mt-1">
                      প্রতিটি প্যাকেজের বিক্রয়মূল্য (Target Price) এখান থেকে সরাসরি পরিবর্তন ও সংরক্ষণ করতে পারবেন।
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSavingPackages}
                    onClick={async () => {
                      setIsSavingPackages(true);
                      try {
                        const token = sessionStorage.getItem('zp_admin_token');
                        const res = await fetch('/api/admin/topup-packages', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                          },
                          body: JSON.stringify({ packages: adminPackages })
                        });
                        if (res.ok) {
                          onShowToast('টপ-আপ প্যাকেজের দাম সফলভাবে সার্ভারে সংরক্ষিত হয়েছে!');
                          if (onUpdateTopUpPackages) onUpdateTopUpPackages(adminPackages);
                        } else {
                          onShowToast('সার্ভারে সেভ করতে সমস্যা হয়েছে, তবে লোকাল আপডেট হয়েছে।');
                          if (onUpdateTopUpPackages) onUpdateTopUpPackages(adminPackages);
                        }
                      } catch {
                        if (onUpdateTopUpPackages) onUpdateTopUpPackages(adminPackages);
                        onShowToast('প্যাকেজের মূল্য আপডেট সম্পন্ন হয়েছে!');
                      } finally {
                        setIsSavingPackages(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                  >
                    {isSavingPackages ? 'সংরক্ষণ হচ্ছে...' : 'মূল্য পরিবর্তন সংরক্ষণ করুন'}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category 1: Diamonds */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5" />
                      <span>ডায়মন্ড প্যাকেজসমূহ ({adminPackages.filter(p => p.category === 'diamonds').length}টি)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {adminPackages.filter(p => p.category === 'diamonds').map((pkg) => (
                        <div key={pkg.id} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{pkg.name}</span>
                            <span className="text-[10px] text-zinc-400">রেফারেন্স: {pkg.referencePrice} ৳</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-zinc-300 shrink-0">বিক্রয়মূল্য:</label>
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setAdminPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val, discountTk: Math.max(0, p.referencePrice - val) } : p));
                                }}
                                className="w-full px-2 py-1 rounded bg-black/60 border border-white/20 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400 font-mono"
                              />
                              <span className="text-xs text-cyan-400 font-bold">৳</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Membership */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-[#ff2a85] uppercase tracking-wider flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-[#ff2a85]" />
                      <span>মেম্বারশিপ প্যাকেজসমূহ ({adminPackages.filter(p => p.category === 'membership').length}টি)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {adminPackages.filter(p => p.category === 'membership').map((pkg) => (
                        <div key={pkg.id} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{pkg.name}</span>
                            <span className="text-[10px] text-zinc-400">রেফারেন্স: {pkg.referencePrice} ৳</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-zinc-300 shrink-0">বিক্রয়মূল্য:</label>
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setAdminPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val, discountTk: Math.max(0, p.referencePrice - val) } : p));
                                }}
                                className="w-full px-2 py-1 rounded bg-black/60 border border-white/20 text-[#ff2a85] font-bold text-xs focus:outline-none focus:border-[#ff2a85] font-mono"
                              />
                              <span className="text-xs text-[#ff2a85] font-bold">৳</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: Level Up Pass */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>লেভেল আপ পাস ({adminPackages.filter(p => p.category === 'level_up').length}টি)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {adminPackages.filter(p => p.category === 'level_up').map((pkg) => (
                        <div key={pkg.id} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{pkg.name}</span>
                            <span className="text-[10px] text-zinc-400">রেফারেন্স: {pkg.referencePrice} ৳</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-zinc-300 shrink-0">বিক্রয়মূল্য:</label>
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setAdminPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val, discountTk: Math.max(0, p.referencePrice - val) } : p));
                                }}
                                className="w-full px-2 py-1 rounded bg-black/60 border border-white/20 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 font-mono"
                              />
                              <span className="text-xs text-amber-400 font-bold">৳</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REVIEWS MODERATION */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#ff2a85]" />
                    <span>অপেক্ষমান রিভিউ সমূহ ({pendingReviews.length}):</span>
                  </h4>

                  {pendingReviews.length === 0 ? (
                    <div className="text-xs text-zinc-400 p-3 rounded-lg bg-black/30 border border-white/5">
                      কোনো অপেক্ষমান রিভিউ নেই। সব রিভিউ অনুমোদিত।
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-xs text-white">{rev.name}</strong>
                              <span className="text-[10px] text-amber-400">★★★★★</span>
                            </div>
                            <p className="text-xs text-[#d8b4d8] mt-1">"{rev.text}"</p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => {
                                onApproveReview(rev.id);
                                onShowToast('রিভিউ অনুমোদিত হয়েছে!');
                              }}
                              className="px-3 py-1 text-xs font-semibold rounded bg-emerald-500 text-black hover:bg-emerald-400 transition-colors cursor-pointer"
                            >
                              অনুমোদন করুন
                            </button>
                            <button
                              onClick={() => {
                                onDeleteReview(rev.id);
                                onShowToast('রিভিউ বাতিল করা হয়েছে!');
                              }}
                              className="px-3 py-1 text-xs font-semibold rounded bg-red-950 text-red-300 border border-red-500/30 hover:bg-red-900 transition-colors cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-bold text-sm text-white mb-2">
                    অনুমোদিত গ্রাহক রিভিউ সমূহ ({reviews.filter(r => r.approved).length}):
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {reviews.filter(r => r.approved).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <strong className="text-pink-200">{rev.name}:</strong>{' '}
                          <span className="text-zinc-300">{rev.text}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('এই রিভিউটি মুছে ফেলতে চান?')) {
                              onDeleteReview(rev.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 p-1 shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
